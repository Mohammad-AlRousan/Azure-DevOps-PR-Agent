
const https = require('https');

/**
 * Parses inline comments from the AI response
 * @param {string} aiResponse - The raw markdown response from AI
 * @returns {Array} Array of comment objects { filePath, lineNumber, content }
 */
function parseInlineComments(aiResponse) {
    const comments = [];

    // Regex to find file sections: #### `filename` (Lines X-Y)
    // and capturing the content block until the next file section or end
    const fileSectionRegex = /####\s*`([^`]+)`\s*\(Lines?\s*(\d+)(?:-(\d+))?\)([\s\S]*?)(?=####\s*`|$)/g;

    let match;
    while ((match = fileSectionRegex.exec(aiResponse)) !== null) {
        const filePath = match[1];
        const startLine = parseInt(match[2]);
        const content = match[4].trim();

        if (filePath && startLine && content) {
            comments.push({
                filePath: filePath,
                lineNumber: startLine, // Anchoring to the start line
                content: content
            });
        }
    }

    return comments;
}

/**
 * Posts inline comments to the PR using Azure DevOps API
 * @param {object} prInfo - PR context information
 * @param {string} pat - Personal Access Token
 * @param {Array} comments - Array of comment objects
 */
async function postInlineComments(prInfo, pat, comments) {
    if (!comments || comments.length === 0) {
        console.log('0️⃣ No inline comments to post.');
        return;
    }

    console.log(`💬 Preparing to post ${comments.length} inline comments...`);

    const repositoryId = prInfo.repositoryName; // Or UUID if available
    const prId = prInfo.prNumber;
    const organizationUrl = prInfo.organizationUrl;
    const projectName = prInfo.projectName;

    // Base API URL for threads
    const threadsUrl = `${organizationUrl}${encodeURIComponent(projectName)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/pullRequests/${prId}/threads?api-version=7.0`;

    for (const comment of comments) {
        try {
            const threadData = {
                comments: [
                    {
                        parentCommentId: 0,
                        content: `🤖 **AI Suggestion**\n\n${comment.content}`,
                        commentType: "text"
                    }
                ],
                status: "active",
                threadContext: {
                    filePath: comment.filePath.startsWith('/') ? comment.filePath : `/${comment.filePath}`,
                    rightFileStart: {
                        line: comment.lineNumber,
                        offset: 1
                    },
                    rightFileEnd: {
                        line: comment.lineNumber,
                        offset: 1
                    }
                }
            };

            await makeAzureDevOpsPostRequest(threadsUrl, pat, threadData);
            console.log(`✅ Posted inline comment on ${comment.filePath}:${comment.lineNumber}`);

            // Brief pause to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`❌ Failed to post inline comment on ${comment.filePath}: ${error.message}`);
        }
    }
}

/**
 * Helper: Make POST request (duplicated from pr-utils to keep this file standalone if needed, 
 * or can import if build system allows. For safety, redeclaring here for the new file).
 */
function makeAzureDevOpsPostRequest(url, pat, data) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`:${pat}`).toString('base64');
        const postData = JSON.stringify(data);
        const urlObj = new URL(url);

        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Azure-DevOps-PR-Agent-Task/1.0.0'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

module.exports = {
    parseInlineComments,
    postInlineComments
};
