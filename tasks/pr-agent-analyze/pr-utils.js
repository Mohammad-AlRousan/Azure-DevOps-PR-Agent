// PR Utilities for Azure DevOps Pipeline Task
const tl = require('azure-pipelines-task-lib/task');
const https = require('https');

/**
 * Detects if the current build is for a Pull Request and extracts PR information
 * @param {string} manualPrUrl - Optional manual PR URL to override auto-detection
 */
function detectPRContext(manualPrUrl) {
    const buildReason = tl.getVariable('Build.Reason');
    const sourceBranch = tl.getVariable('Build.SourceBranch');
    const prNumber = tl.getVariable('System.PullRequest.PullRequestNumber');
    const prTitle = tl.getVariable('System.PullRequest.PullRequestTitle');
    const prAuthor = tl.getVariable('System.PullRequest.PullRequestCreatedBy.DisplayName');
    const targetBranch = tl.getVariable('System.PullRequest.TargetBranch');
    const repositoryUri = tl.getVariable('Build.Repository.Uri');
    const projectName = tl.getVariable('System.TeamProject');
    const repositoryName = tl.getVariable('Build.Repository.Name');
    const organizationUrl = tl.getVariable('System.TeamFoundationCollectionUri');

    // Check if manual PR URL is provided
    if (manualPrUrl) {
        console.log(`🔗 Using manual PR URL: ${manualPrUrl}`);
        const parsedPrInfo = parsePRUrl(manualPrUrl);
        if (parsedPrInfo) {
            return {
                isPR: true,
                prNumber: parsedPrInfo.prNumber,
                prTitle: parsedPrInfo.prTitle || 'Manual PR Analysis',
                prAuthor: 'Manual',
                sourceBranch: 'Unknown',
                targetBranch: 'Unknown',
                repositoryUri: parsedPrInfo.repositoryUri,
                repositoryName: parsedPrInfo.repositoryName,
                projectName: parsedPrInfo.projectName,
                organizationUrl: parsedPrInfo.organizationUrl,
                prUrl: manualPrUrl,
                buildReason: 'Manual'
            };
        } else {
            console.log('⚠️ Failed to parse manual PR URL, falling back to auto-detection');
        }
    }

    const isPR = buildReason === 'PullRequest' && prNumber;

    // Construct PR URL
    let prUrl = null;
    if (isPR && organizationUrl && projectName && repositoryName && prNumber) {
        prUrl = `${organizationUrl.replace(/\/$/, '')}/${encodeURIComponent(projectName)}/_git/${encodeURIComponent(repositoryName)}/pullrequest/${prNumber}`;
    }

    return {
        isPR,
        prNumber: prNumber ? parseInt(prNumber) : null,
        prTitle: prTitle || 'Unknown',
        prAuthor: prAuthor || 'Unknown',
        sourceBranch: sourceBranch || 'Unknown',
        targetBranch: targetBranch || 'Unknown',
        repositoryUri: repositoryUri || '',
        repositoryName: repositoryName || '',
        projectName: projectName || '',
        organizationUrl: organizationUrl || '',
        prUrl: prUrl,
        buildReason
    };
}

/**
 * Parses a PR URL to extract organization, project, repository, and PR number
 * @param {string} prUrl - PR URL to parse
 * @returns {object|null} Parsed PR information or null if invalid
 */
function parsePRUrl(prUrl) {
    try {
        // Expected format: https://dev.azure.com/org/project/_git/repo/pullrequest/123
        // or: https://org.visualstudio.com/project/_git/repo/pullrequest/123

        const url = new URL(prUrl);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);

        let organizationUrl, projectName, repositoryName, prNumber;

        if (url.hostname === 'dev.azure.com') {
            // New format: https://dev.azure.com/org/project/_git/repo/pullrequest/123
            if (pathParts.length >= 5 && pathParts[2] === '_git' && pathParts[4] === 'pullrequest') {
                organizationUrl = `https://dev.azure.com/${pathParts[0]}/`;
                projectName = decodeURIComponent(pathParts[1]);
                repositoryName = decodeURIComponent(pathParts[3]);
                prNumber = parseInt(pathParts[5]);
            }
        } else if (url.hostname.endsWith('.visualstudio.com')) {
            // Old format: https://org.visualstudio.com/project/_git/repo/pullrequest/123
            if (pathParts.length >= 4 && pathParts[1] === '_git' && pathParts[3] === 'pullrequest') {
                const orgName = url.hostname.replace('.visualstudio.com', '');
                organizationUrl = `https://${orgName}.visualstudio.com/`;
                projectName = decodeURIComponent(pathParts[0]);
                repositoryName = decodeURIComponent(pathParts[2]);
                prNumber = parseInt(pathParts[4]);
            }
        }

        if (organizationUrl && projectName && repositoryName && prNumber && !isNaN(prNumber)) {
            return {
                organizationUrl,
                projectName,
                repositoryName,
                repositoryUri: `${organizationUrl}${projectName}/_git/${repositoryName}`,
                prNumber,
                prTitle: null // Will be fetched later if needed
            };
        }

        return null;
    } catch (error) {
        console.log(`⚠️ Error parsing PR URL: ${error.message}`);
        return null;
    }
}

/**
 * Gets the list of changed files in the PR
 */
async function getChangedFilesInPR(prInfo) {
    if (!prInfo.isPR) {
        return [];
    }

    try {
        // Use Azure DevOps REST API to get changed files
        // Prioritize environment variable PAT over System.AccessToken
        const pat = process.env.AZURE_DEVOPS_PAT || tl.getVariable('System.AccessToken');

        if (!pat) {
            console.log('⚠️ No access token available to get changed files. Analyzing all files.');
            return [];
        }

        console.log(`🔑 Using ${process.env.AZURE_DEVOPS_PAT ? 'AZURE_DEVOPS_PAT environment variable' : 'System.AccessToken'} for authentication`);
        console.log(`🔑 PAT length: ${pat.length} characters`);

        const apiUrl = `${prInfo.organizationUrl}${encodeURIComponent(prInfo.projectName)}/_apis/git/repositories/${encodeURIComponent(prInfo.repositoryName)}/pullRequests/${prInfo.prNumber}/iterations?api-version=7.0`;

        console.log(`🔍 Getting changed files from: ${apiUrl}`);

        const response = await makeAzureDevOpsRequest(apiUrl, pat);

        if (response && response.value && response.value.length > 0) {
            // Get the latest iteration
            const latestIteration = response.value[response.value.length - 1];

            // Get changes for this iteration
            const changesUrl = `${prInfo.organizationUrl}${encodeURIComponent(prInfo.projectName)}/_apis/git/repositories/${encodeURIComponent(prInfo.repositoryName)}/pullRequests/${prInfo.prNumber}/iterations/${latestIteration.id}/changes?api-version=7.0`;

            const changesResponse = await makeAzureDevOpsRequest(changesUrl, pat);

            if (changesResponse && changesResponse.changeEntries) {
                return changesResponse.changeEntries
                    .filter(change => change.changeType !== 'delete') // Skip deleted files
                    .map(change => ({
                        path: change.item.path.startsWith('/') ? change.item.path.substring(1) : change.item.path,
                        changeType: change.changeType
                    }));
            }
        }

        return [];
    } catch (error) {
        console.log(`⚠️ Failed to get changed files: ${error.message}`);
        return [];
    }
}

/**
 * Makes a request to Azure DevOps REST API
 */
function makeAzureDevOpsRequest(url, pat) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`:${pat}`).toString('base64');

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Azure-DevOps-PR-Agent-Task/1.0.0'
            }
        };

        const urlObj = new URL(url);
        options.hostname = urlObj.hostname;
        options.port = urlObj.port || 443;
        options.path = urlObj.pathname + urlObj.search;

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const result = JSON.parse(data);
                        resolve(result);
                    } else {
                        reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse API response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Posts a comment to the PR
 */
async function postCommentToPR(prInfo, analysisResult) {
    if (!prInfo.isPR) {
        console.log('📝 Not a PR build - skipping comment posting');
        return;
    }

    try {
        // Prioritize environment variable PAT over System.AccessToken
        const pat = process.env.AZURE_DEVOPS_PAT || tl.getVariable('System.AccessToken');

        if (!pat) {
            console.log('⚠️ No access token available to post comments');
            return;
        }

        console.log(`🔑 Using ${process.env.AZURE_DEVOPS_PAT ? 'AZURE_DEVOPS_PAT environment variable' : 'System.AccessToken'} for comment posting`);
        console.log(`🔑 PAT length: ${pat.length} characters`);

        // Check if this is a separate comment with custom header
        const commentText = analysisResult.customHeader ?
            analysisResult.customHeader + formatAnalysisComment(analysisResult, prInfo, true) :
            formatAnalysisComment(analysisResult, prInfo, false);

        // Check for existing AI comments to avoid duplicates
        const analysisType = analysisResult.analysisType || 'analysis';
        const existingThreadId = await findExistingAIComment(prInfo, pat, analysisType);

        if (existingThreadId) {
            console.log(`🔄 Updating existing ${analysisType} comment (thread ${existingThreadId})`);
            await updateExistingComment(prInfo, pat, existingThreadId, commentText);
        } else {
            console.log(`💬 Creating new ${analysisType} comment`);
            await createNewComment(prInfo, pat, commentText);
        }

        console.log('✅ Comment posted successfully');

    } catch (error) {
        console.log(`⚠️ Failed to post comment: ${error.message}`);
    }
}

async function findExistingAIComment(prInfo, pat, analysisType) {
    try {
        // Get existing comment threads
        const threadsUrl = `${prInfo.organizationUrl}${encodeURIComponent(prInfo.projectName)}/_apis/git/repositories/${encodeURIComponent(prInfo.repositoryName)}/pullRequests/${prInfo.prNumber}/threads?api-version=7.0`;

        const response = await makeAzureDevOpsGetRequest(threadsUrl, pat);
        const threads = response.value || [];

        // Look for existing AI comment with matching analysis type
        for (const thread of threads) {
            if (thread.comments && thread.comments.length > 0) {
                const firstComment = thread.comments[0];
                if (firstComment.content && firstComment.content.includes('🤖 AI')) {
                    // Check for specific analysis type in the header
                    const analysisTypeMap = {
                        'describe': 'Description',
                        'review': 'Review',
                        'improve': 'Improvement',
                        'tests': 'Tests',
                        'compliance': 'Compliance',
                        'auto-approve': 'Auto-Approve',
                        'labels': 'Labels'
                    };

                    const expectedTitle = analysisTypeMap[analysisType];
                    if (expectedTitle && firstComment.content.includes(`🤖 AI ${expectedTitle}`)) {
                        return thread.id;
                    }
                }
            }
        }

        return null;
    } catch (error) {
        console.log(`⚠️ Failed to check existing comments: ${error.message}`);
        return null;
    }
}

async function updateExistingComment(prInfo, pat, threadId, commentText) {
    try {
        // Update the first comment in the thread
        const updateUrl = `${prInfo.organizationUrl}${encodeURIComponent(prInfo.projectName)}/_apis/git/repositories/${encodeURIComponent(prInfo.repositoryName)}/pullRequests/${prInfo.prNumber}/threads/${threadId}/comments/1?api-version=7.0`;

        const updateData = {
            content: commentText
        };

        await makeAzureDevOpsPatchRequest(updateUrl, pat, updateData);
        console.log(`✅ Updated existing comment in thread ${threadId}`);

    } catch (error) {
        console.log(`⚠️ Failed to update existing comment: ${error.message}`);
        // Fallback to creating new comment
        await createNewComment(prInfo, pat, commentText);
    }
}

async function createNewComment(prInfo, pat, commentText) {
    // Create comment thread using Azure DevOps REST API
    const apiUrl = `${prInfo.organizationUrl}${encodeURIComponent(prInfo.projectName)}/_apis/git/repositories/${encodeURIComponent(prInfo.repositoryName)}/pullRequests/${prInfo.prNumber}/threads?api-version=7.0`;

    const commentData = {
        comments: [
            {
                content: commentText,
                commentType: 'text'
            }
        ],
        status: 'active'
    };

    console.log(`💬 Posting comment to PR #${prInfo.prNumber}`);

    await makeAzureDevOpsPostRequest(apiUrl, pat, commentData);
}

/**
 * Makes a GET request to Azure DevOps REST API
 */
function makeAzureDevOpsGetRequest(url, pat) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`:${pat}`).toString('base64');

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Azure-DevOps-PR-Agent-Task/1.0.0'
            }
        };

        const urlObj = new URL(url);
        options.hostname = urlObj.hostname;
        options.port = urlObj.port || 443;
        options.path = urlObj.pathname + urlObj.search;

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const result = JSON.parse(responseData);
                        resolve(result);
                    } else {
                        reject(new Error(`API request failed with status ${res.statusCode}: ${responseData}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse API response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Makes a PATCH request to Azure DevOps REST API
 */
function makeAzureDevOpsPatchRequest(url, pat, data) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`:${pat}`).toString('base64');
        const patchData = JSON.stringify(data);

        const options = {
            method: 'PATCH',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(patchData),
                'User-Agent': 'Azure-DevOps-PR-Agent-Task/1.0.0'
            }
        };

        const urlObj = new URL(url);
        options.hostname = urlObj.hostname;
        options.port = urlObj.port || 443;
        options.path = urlObj.pathname + urlObj.search;

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const result = JSON.parse(responseData);
                        resolve(result);
                    } else {
                        reject(new Error(`API request failed with status ${res.statusCode}: ${responseData}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse API response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(patchData);
        req.end();
    });
}

/**
 * Makes a POST request to Azure DevOps REST API
 */
function makeAzureDevOpsPostRequest(url, pat, data) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`:${pat}`).toString('base64');
        const postData = JSON.stringify(data);

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Azure-DevOps-PR-Agent-Task/1.0.0'
            }
        };

        const urlObj = new URL(url);
        options.hostname = urlObj.hostname;
        options.port = urlObj.port || 443;
        options.path = urlObj.pathname + urlObj.search;

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const result = JSON.parse(responseData);
                        resolve(result);
                    } else {
                        reject(new Error(`API request failed with status ${res.statusCode}: ${responseData}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse API response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Formats the analysis result as a PR comment
 */
function formatAnalysisComment(analysisResult, prInfo, hasCustomHeader = false) {
    const timestamp = new Date().toLocaleString();
    const analysisType = analysisResult.analysisType || 'review';
    const MAX_COMMENT_LENGTH = 32000;

    let comment = '';

    // --- HEADER GENERATION ---
    if (analysisResult.customHeader && !hasCustomHeader) {
        comment += analysisResult.customHeader;
    } else if (!hasCustomHeader) {
        const typeTitle = analysisType.charAt(0).toUpperCase() + analysisType.slice(1);
        comment += `## 🤖 AI ${typeTitle}\n\n`;
        comment += `**Timestamp:** ${timestamp}\n`;
        if (prInfo) {
            comment += `**PR:** #${prInfo.prNumber} - ${prInfo.prTitle}\n`;
        }
        comment += `**Analysis:** ${typeTitle} analysis for pull request changes\n\n`;
    }

    // --- MAIN CONTENT GENERATION ---
    // If we have a raw AI response, use it as the primary content (Best Practice)
    if (analysisResult.rawResponse && analysisResult.rawResponse.trim().length > 50) {
        // We still check for summary stats to potentially show a quick badge row at the top
        // but the main content comes from the AI's markdown
        /* 
           If specific JSON metrics were parsed separately, we could prepend them here, 
           but our prompts now ask for a Summary Table in the Markdown itself.
           So we can trust the rawResponse.
        */

        let rawContent = analysisResult.rawResponse.trim();

        // Remove duplicate headers if the AI generated them
        // (The prompt generates "## 🔍 Code Review Summary", so we don't need to add our own "Summary" header)

        comment += `${rawContent}\n\n`;

    } else {
        // --- FALLBACK CONTENT GENERATION ---
        // Only used if rawResponse is missing or empty
        console.log('⚠️ Raw response missing or too short, using fallback reconstruction...');

        if (analysisResult.summary) {
            comment += `### 📊 Summary\n`;
            const summaryItems = [];
            if (analysisResult.summary.qualityScore !== undefined) summaryItems.push(`Quality: ${analysisResult.summary.qualityScore}%`);
            if (analysisResult.summary.securityScore !== undefined) summaryItems.push(`Security: ${analysisResult.summary.securityScore}%`);
            if (analysisResult.summary.issuesFound !== undefined) summaryItems.push(`Issues: ${analysisResult.summary.issuesFound}`);
            if (analysisResult.summary.suggestions !== undefined) summaryItems.push(`Suggestions: ${analysisResult.summary.suggestions}`);
            comment += summaryItems.join(' | ') + '\n\n';
        }

        // Issues
        const validIssues = analysisResult.issues?.filter(i => i.message && i.message.trim().length > 0) || [];
        if (validIssues.length > 0) {
            comment += `### ⚠️ Issues Found\n`;
            validIssues.forEach((issue, index) => {
                const severity = issue.severity || 'Warning';
                const message = issue.message || issue.text || 'Issue';
                const file = issue.file || '';
                const line = issue.line || '';
                comment += `${index + 1}. **${severity}**: ${message}`;
                if (file) comment += ` (\`${file}${line ? ':' + line : ''}\`)`;
                comment += '\n';
            });
            comment += '\n';
        }

        // Suggestions
        const validSuggestions = analysisResult.suggestions?.filter(s => s.message && s.message.trim().length > 0) || [];
        if (validSuggestions.length > 0) {
            comment += `### 💡 Suggestions\n`;
            validSuggestions.forEach((suggestion, index) => {
                let message = suggestion.message || 'Suggestion';
                comment += `${index + 1}. **${message}**\n`;
            });
            comment += '\n';
        }

        if (validIssues.length === 0 && validSuggestions.length === 0) {
            comment += `### ℹ️ Analysis Complete\nNo specific issues or suggestions found.\n\n`;
        }
    }

    // --- TRUNCATION CHECK ---
    if (comment.length > MAX_COMMENT_LENGTH) {
        console.log(`⚠️ Comment too long (${comment.length}), truncating...`);
        comment = comment.substring(0, MAX_COMMENT_LENGTH - 500);
        comment += `\n\n---\n\n*[Comment truncated due to length limit]*`;
    }

    // --- FOOTER ---
    comment += `---\n`;
    comment += `*Auto Generated by Azure DevOps PR Agent*`;

    return comment;
}

/**
 * Generate meaningful suggestions when AI response lacks them
 * @param {string} analysisType - Type of analysis being performed
 * @param {Array} issues - Array of issues found
 * @returns {Array} Array of meaningful suggestions
 */
function generateMeaningfulSuggestions(analysisType, issues = []) {
    const suggestions = [];

    switch (analysisType) {
        case 'review':
            suggestions.push(
                {
                    message: 'Consider adding more detailed comments to improve code readability',
                    description: 'Code documentation helps future maintainers understand the logic and intent'
                },
                {
                    message: 'Review function and variable naming for clarity',
                    description: 'Clear, descriptive names make code self-documenting and easier to understand'
                },
                {
                    message: 'Consider breaking down complex functions into smaller, focused units',
                    description: 'Smaller functions are easier to test, debug, and maintain'
                }
            );
            break;

        case 'security':
            suggestions.push(
                {
                    message: 'Review input validation and sanitization practices',
                    description: 'Validate all user inputs to prevent injection attacks and data corruption'
                },
                {
                    message: 'Ensure sensitive data is properly protected',
                    description: 'Use encryption for sensitive data and avoid logging confidential information'
                },
                {
                    message: 'Review authentication and authorization mechanisms',
                    description: 'Implement proper access controls and session management'
                }
            );
            break;

        case 'improve':
            suggestions.push(
                {
                    message: 'Consider optimizing database queries and API calls',
                    description: 'Reduce unnecessary database hits and implement efficient caching strategies'
                },
                {
                    message: 'Review error handling and logging practices',
                    description: 'Implement comprehensive error handling with appropriate logging levels'
                },
                {
                    message: 'Consider implementing performance monitoring',
                    description: 'Add metrics and monitoring to track application performance'
                }
            );
            break;

        case 'tests':
            suggestions.push(
                {
                    message: 'Add unit tests for new functionality',
                    description: 'Ensure all new code paths are covered by appropriate unit tests'
                },
                {
                    message: 'Consider adding integration tests for critical workflows',
                    description: 'Test end-to-end functionality to catch integration issues'
                },
                {
                    message: 'Review test coverage and add missing test cases',
                    description: 'Aim for comprehensive test coverage of business logic and edge cases'
                }
            );
            break;

        case 'compliance':
            suggestions.push(
                {
                    message: 'Ensure code follows established coding standards',
                    description: 'Consistent coding style improves readability and maintainability'
                },
                {
                    message: 'Review documentation and inline comments',
                    description: 'Proper documentation helps with code maintenance and knowledge transfer'
                },
                {
                    message: 'Verify license compliance and dependency management',
                    description: 'Ensure all dependencies have compatible licenses and are up to date'
                }
            );
            break;

        case 'auto-approve':
            suggestions.push(
                {
                    message: 'Review changes for potential risks before auto-approval',
                    description: 'Ensure changes meet quality and security standards for automated approval'
                },
                {
                    message: 'Verify all tests pass and coverage is maintained',
                    description: 'Auto-approval should only occur when all quality gates are met'
                }
            );
            break;

        default:
            suggestions.push(
                {
                    message: 'Review code for best practices and maintainability',
                    description: 'Follow established patterns and conventions for better code quality'
                },
                {
                    message: 'Consider adding or updating documentation',
                    description: 'Good documentation helps with code understanding and maintenance'
                }
            );
    }

    // Add issue-specific suggestions if issues were found
    if (issues.length > 0) {
        suggestions.push({
            message: `Address the ${issues.length} identified issue${issues.length > 1 ? 's' : ''}`,
            description: 'Review and resolve the issues identified in the analysis above'
        });
    }

    return suggestions;
}

/**
 * Update PR description with AI-generated content
 */
async function updatePRDescription(prInfo, description) {
    try {
        const pat = process.env.AZURE_DEVOPS_PAT || process.env.SYSTEM_ACCESSTOKEN;
        if (!pat) {
            throw new Error('Azure DevOps PAT not available');
        }

        // Azure DevOps has a 4000 character limit for PR descriptions
        const MAX_DESCRIPTION_LENGTH = 4000;

        let truncatedDescription = description;
        if (description && description.length > MAX_DESCRIPTION_LENGTH) {
            console.log(`⚠️ PR description is ${description.length} characters, truncating to ${MAX_DESCRIPTION_LENGTH} characters...`);

            // Try to truncate at a sentence boundary
            const truncated = description.substring(0, MAX_DESCRIPTION_LENGTH - 100); // Leave room for truncation notice
            const lastSentenceEnd = Math.max(
                truncated.lastIndexOf('. '),
                truncated.lastIndexOf('! '),
                truncated.lastIndexOf('? '),
                truncated.lastIndexOf('\n\n')
            );

            if (lastSentenceEnd > MAX_DESCRIPTION_LENGTH * 0.8) { // Only use sentence boundary if it's not too early
                truncatedDescription = description.substring(0, lastSentenceEnd + 1);
            } else {
                truncatedDescription = description.substring(0, MAX_DESCRIPTION_LENGTH - 50);
            }

            truncatedDescription += `\n\n*[Description truncated due to length limit. Original length: ${description.length} characters]*`;

            console.log(`📝 Truncated description to ${truncatedDescription.length} characters`);
        }

        const url = `${prInfo.organizationUrl}${prInfo.projectName}/_apis/git/repositories/${prInfo.repositoryName}/pullrequests/${prInfo.prNumber}?api-version=7.0`;

        const updateData = {
            description: truncatedDescription
        };

        console.log(`📝 Updating PR description for PR #${prInfo.prNumber} (${truncatedDescription.length} characters)...`);

        const response = await makeAzureDevOpsPatchRequest(url, pat, updateData);

        if (response && response.id) {
            console.log(`✅ PR description updated successfully`);
            return true;
        } else {
            throw new Error('Failed to update PR description - no response');
        }
    } catch (error) {
        console.log(`❌ Failed to update PR description: ${error.message}`);
        return false;
    }
}

/**
 * Update PR labels with AI-generated labels
 */
async function updatePRLabels(prInfo, labelsContent) {
    try {
        const pat = process.env.AZURE_DEVOPS_PAT || process.env.SYSTEM_ACCESSTOKEN;
        if (!pat) {
            throw new Error('Azure DevOps PAT not available');
        }

        // Parse labels from the AI response
        const labels = parseLabelsFromContent(labelsContent);
        if (!labels || labels.length === 0) {
            console.log('⚠️ No labels found in AI response');
            return false;
        }

        console.log(`🏷️ Adding labels to PR #${prInfo.prNumber}: ${labels.join(', ')}...`);

        // Add each label
        for (const label of labels) {
            const url = `${prInfo.organizationUrl}${prInfo.projectName}/_apis/git/repositories/${prInfo.repositoryName}/pullrequests/${prInfo.prNumber}/labels?api-version=7.0`;

            const labelData = {
                name: label
            };

            try {
                await makeAzureDevOpsPostRequest(url, pat, labelData);
                console.log(`✅ Added label: ${label}`);
            } catch (error) {
                console.log(`⚠️ Failed to add label ${label}: ${error.message}`);
            }
        }

        return true;
    } catch (error) {
        console.log(`❌ Failed to update PR labels: ${error.message}`);
        return false;
    }
}

/**
 * Parse labels from AI response content (matches Python logic exactly)
 */
function parseLabelsFromContent(content) {
    try {
        console.log(`🔍 Parsing labels from content (${content.length} characters)...`);

        const labelsToAdd = [];

        // Parse lines starting with "- " (matches Python logic exactly)
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('- ')) {
                const labelPart = line.substring(2).trim();
                console.log(`🔍 Found label line: "${labelPart}"`);

                if (labelPart.includes(':')) {
                    // Extract label name and score, then format (matches Python logic)
                    const parts = labelPart.split(':');
                    const name = parts[0].trim().replace(/\s+/g, '-').toLowerCase(); // e.g., size-of-changes
                    const scorePart = parts[1].trim();

                    let formattedLabel;
                    if (scorePart.includes('/')) { // Check for x/5 format
                        const score = scorePart.split('/')[0];
                        formattedLabel = `${name}:${score}/5`;
                    } else {
                        formattedLabel = `${name}:${scorePart}`;
                    }

                    console.log(`🏷️ Parsed label: "${formattedLabel}"`);
                    labelsToAdd.push(formattedLabel);
                }
            }
        }

        console.log(`✅ Parsed ${labelsToAdd.length} labels: ${labelsToAdd.join(', ')}`);
        return labelsToAdd;

    } catch (error) {
        console.log(`⚠️ Failed to parse labels from content: ${error.message}`);
        return [];
    }
}

module.exports = {
    detectPRContext,
    getChangedFilesInPR,
    postCommentToPR,
    formatAnalysisComment,
    generateMeaningfulSuggestions,
    updatePRDescription,
    updatePRLabels
};
