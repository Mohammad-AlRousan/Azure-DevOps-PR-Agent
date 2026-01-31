/**
 * Production-aligned prompts that match the Python version exactly
 * This ensures consistent results between Python CLI and Extension
 */

class ProductionPrompts {
    /**
     * Get base context for all prompts (matches Python CommonPrompts.get_base_context)
     */
    static getBaseContext(prDetails) {
        const filesChanged = prDetails.files ? prDetails.files.map(f => f.path).join(', ') : 'No files detected';
        const fileContents = prDetails.files ? prDetails.files.map(f =>
            `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
        ).join('\n') : 'No file contents available';

        return {
            title: prDetails.title || 'No title provided',
            description: prDetails.description || 'No description provided',
            files_changed: filesChanged,
            file_contents: fileContents
        };
    }

    /**
     * Common focus instruction (matches Python CommonPrompts.FOCUS_INSTRUCTION)
     */
    static get FOCUS_INSTRUCTION() {
        return "Focus ONLY on new features, bug fixes, and affected areas introduced in this PR.";
    }

    /**
     * Security focus section (matches Python CommonPrompts.SECURITY_FOCUS)
     */
    static get SECURITY_FOCUS() {
        return `**Security Focus**: Look for potential vulnerabilities, exposed secrets, authentication issues, and data validation problems.`;
    }

    /**
     * Code quality focus section (matches Python CommonPrompts.CODE_QUALITY_FOCUS)
     */
    static get CODE_QUALITY_FOCUS() {
        return `**Code Quality Focus**: Evaluate readability, maintainability, performance, and adherence to best practices.`;
    }

    /**
     * Review prompt (enhanced for deeper analysis)
     */
    static getReviewPrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        return `Perform a comprehensive code review for the following pull request. ${this.FOCUS_INSTRUCTION}

**Analysis Requirements:**
1. **Security Analysis**: Identify vulnerabilities, exposed secrets, authentication issues
2. **Code Quality**: Evaluate maintainability, readability, performance, best practices
3. **Bug Detection**: Find potential runtime errors, logic issues, edge cases
4. **Architecture Review**: Assess design patterns, modularity, coupling
5. **Specific Recommendations**: Provide actionable, line-specific suggestions

Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

**Output Format:**

## 🔍 Code Review Summary

| Category | Score | Assessment |
| :--- | :---: | :--- |
| **Overall Quality** | [0-10] | [Brief assessment] |
| **Security Risk** | [Low/Med/High] | [Key concerns or "None"] |
| **Maintainability** | [0-10] | [Brief assessment] |

## 🚨 Critical Issues
*Only if applicable. Use "None" if no critical issues found.*
- [Issue 1]: [Description]
- [Issue 2]: [Description]

## 💡 Suggestions & Best Practices
<details open>
<summary>Click to view detailed suggestions</summary>

### 🛡️ Security
- [Security Improvement 1]
- [Security Improvement 2]

### ⚡ Performance & Quality
- [Performance/Quality Improvement 1]
- [Performance/Quality Improvement 2]

</details>

## 📁 File-Specific Comments
*Group comments by file. Use code blocks for suggestions.*

**\`filename.ext\`**
- **Line [N]**: [Comment/Suggestion]
  \`\`\`suggestion
  [Proposed Code Change]
  \`\`\`

${this.SECURITY_FOCUS}
${this.CODE_QUALITY_FOCUS}`;
    }

    /**
     * Improve prompt (enhanced for comprehensive improvements)
     */
    static getImprovePrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        return `Provide comprehensive code improvement suggestions for the following pull request. ${this.FOCUS_INSTRUCTION}

**Improvement Categories:**
1. **Performance Optimizations**: Identify bottlenecks, inefficient algorithms, resource usage
2. **Code Architecture**: Suggest better design patterns, modularity, separation of concerns
3. **Maintainability**: Improve readability, reduce complexity, enhance documentation
4. **Security Hardening**: Strengthen authentication, validation, error handling
5. **Best Practices**: Apply language-specific conventions, modern patterns
6. **Testing Strategy**: Suggest testability improvements and test coverage

Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

**Output Format:**

## 🚀 Code Improvement Analysis

### 📊 Summary Board

| Category | Status | Key Focus |
| :--- | :---: | :--- |
| **Performance** | [High/Med/Low Impact] | [Key optimization] |
| **Architecture** | [Good/Needs Work] | [Proposed pattern] |
| **Security** | [Secure/Risk] | [Enhancement] |

### 🎯 Priority Improvements

#### 🔥 High Priority
*Critical improvements for immediate action*
- [Improvement 1]
- [Improvement 2]

#### ⚡ Performance & Optimization
*Efficiency gains*
- [Optimization 1]
- [Optimization 2]

### 📁 File-Specific Improvements
<details open>
<summary>Click to view code suggestions</summary>

#### \`filename.ext\` (Lines X-Y)
**Issue**: [What needs improvement]

**current:**
\`\`\`language
[exact current code]
\`\`\`

**improved:**
\`\`\`language
[improved code]
\`\`\`

**Benefits**:
- [Benefit 1]
- [Benefit 2]

</details>

### 🧪 Testing & Docs
- [Testing Recommendation]
- [Documentation Enhancement]

${this.CODE_QUALITY_FOCUS}`;
    }

    /**
     * Test prompt (matches Python TestPrompts.get_test_prompt exactly)
     */
    static getTestPrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        return `Generate comprehensive test case suggestions (max 250 words) for the following pull request. ${this.FOCUS_INSTRUCTION} Provide specific test scenarios, edge cases, and testing strategies.

Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

Consider:
- Unit tests for new functions/methods
- Integration tests for component interactions
- Edge cases and error scenarios
- Performance testing if applicable
- Security testing for sensitive operations
- Regression testing for modified functionality

Format as Markdown with:

## 🧪 Test Strategy
| Type | Coverage Target | Focus |
| :--- | :--- | :--- |
| **Unit** | [Target %] | [Focus area] |
| **Integration** | [Modules] | [Interaction flow] |

## 📋 Test Scenarios
<details open>
<summary>Click to view test cases</summary>

### ✅ Happy Path
- [Scenario 1]
- [Scenario 2]

### ⚠️ Edge Cases
- [Scenario 1]
- [Scenario 2]

### 🛡️ Security & Performance
- [Scenario 1]
- [Scenario 2]

</details>`;
    }

    /**
     * Compliance prompt (matches Python CompliancePrompts.get_compliance_prompt exactly)
     */
    static getCompliancePrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        return `Perform compliance checks for the following pull request. ${this.FOCUS_INSTRUCTION} Check for adherence to coding standards, documentation requirements, and best practices.
Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

**Compliance Areas to Check:**
- Coding standards and style guidelines
- Documentation completeness
- Naming conventions
- Error handling patterns
- Security compliance
- Performance considerations
- Test coverage requirements

Format your response as Markdown:

## 📋 Compliance Checklist

| Requirement | Status | Notes |
| :--- | :---: | :--- |
| **Coding Standards** | [✅/⚠️/❌] | [Notes] |
| **Documentation** | [✅/⚠️/❌] | [Notes] |
| **Security** | [✅/⚠️/❌] | [Notes] |
| **Testing** | [✅/⚠️/❌] | [Notes] |

## 🔍 Detailed Findings
- [Specific finding 1]
- [Specific finding 2]

## 💡 Remediation Steps
- [Action 1]
- [Action 2]`;
    }

    /**
     * Describe prompt (concise and focused)
     */
    static getDescribePrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        return `Generate a concise, professional pull request description. ${this.FOCUS_INSTRUCTION} Analyze the code changes and create a clear, focused description.

Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

**Required Output Format (Markdown only):**

## 📋 Summary
[Brief 2-3 sentence overview of what this PR accomplishes]

## 🎯 Purpose
| Type | Description |
| :--- | :--- |
| **Problem** | [What issue does this solve?] |
| **Solution** | [How does this PR address the problem?] |
| **Value** | [Why is this change important?] |

## 🔧 Key Changes
*List key changes by category*

### 💻 Code
- [Change 1]
- [Change 2]

### 🏗️ Infrastructure / Config
- [Change 1]

## 🧪 Verification
- [Testing approach used]

## 📝 Reviewer Notes
[Any important considerations]

**Important**: Return clean Markdown text only. Do not use JSON format.`;
    }

    /**
     * Ask prompt (matches Python AnswerPrompts.get_answer_prompt exactly)
     */
    static getAskPrompt(prDetails, question) {
        const context = this.getBaseContext(prDetails);
        return `Answer the following question about the pull request concisely (max 150 words), focusing ONLY on the changes introduced in this PR. Use the provided PR details and file contents to formulate your answer.

Question: ${question}
Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

Format your response as follows:
## ❓ Question
${question}
## 📝 Answer
[Your detailed answer here based on the PR changes]
## 🔍 Key Changes
- [List key changes that relate to the question]
## 📁 Relevant Files
- [List files that are most relevant to the answer]

Keep it concise and focused on the PR changes. Format as Markdown.`;
    }

    /**
     * Labels prompt (enhanced for comprehensive PR categorization)
     */
    static getLabelsPrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        const filesChangedStr = context.files_changed;
        return `Analyze this pull request and suggest comprehensive labels/tags for categorization. ${this.FOCUS_INSTRUCTION} Provide intelligent labeling based on code analysis, change patterns, and impact assessment.

Title: ${context.title}
Description: ${context.description}
Files changed: ${filesChangedStr}
File Contents:
${context.file_contents}

**Required Label Categories (score 1-5):**

### 📊 **Effort & Size Assessment**
- **review-effort**: Review complexity (1=trivial, 2=simple, 3=moderate, 4=complex, 5=extensive)
- **size-of-changes**: Code change volume (1=tiny, 2=small, 3=medium, 4=large, 5=massive)
- **testing-effort**: Testing requirements (1=minimal, 2=basic, 3=standard, 4=comprehensive, 5=extensive)

### 🎯 **Change Type Classification**
- **feature**: New functionality (1=minor, 2=small, 3=moderate, 4=major, 5=significant)
- **bugfix**: Bug resolution (1=trivial, 2=minor, 3=moderate, 4=critical, 5=hotfix)
- **refactor**: Code restructuring (1=minimal, 2=localized, 3=moderate, 4=significant, 5=major)
- **documentation**: Documentation changes (1=typos, 2=minor, 3=updates, 4=new-docs, 5=comprehensive)

### 🔒 **Risk & Quality Assessment**
- **security-impact**: Security implications (1=none, 2=low, 3=medium, 4=high, 5=critical)
- **breaking-changes**: Compatibility impact (1=none, 2=minor, 3=moderate, 4=significant, 5=major)
- **performance-impact**: Performance implications (1=none, 2=minor, 3=moderate, 4=significant, 5=major)
- **quality-of-code**: Code quality level (1=poor, 2=below-avg, 3=average, 4=good, 5=excellent)

### 🏷️ **Technology & Domain Tags**
[Suggest 2-3 relevant technology/domain tags based on files changed]

**Output Format:**
## 🏷️ Suggested Labels

### Core Assessment Labels
- review-effort:X/5 - [reasoning]
- size-of-changes:X/5 - [reasoning]
- quality-of-code:X/5 - [reasoning]
- security-impact:X/5 - [reasoning]

### Change Type Labels
- [change-type]:X/5 - [reasoning]

### Technology Tags
- [tech-tag-1] - [reasoning]
- [tech-tag-2] - [reasoning]

### Priority Recommendation
**Priority**: [Low/Medium/High/Critical] - [justification]

Format as Markdown with clear categorization and scoring rationale.`;
    }

    /**
     * Auto-approve prompt (matches Python production auto-approve logic)
     */
    static getAutoApprovePrompt(prDetails) {
        const context = this.getBaseContext(prDetails);
        return `Evaluate this pull request for auto-approval. ${this.FOCUS_INSTRUCTION} Assess the risk level and provide a recommendation.
Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

**Evaluation Criteria:**
- Risk assessment of changes
- Code quality and safety
- Test coverage and validation
- Compliance with standards
- Security implications

Provide a clear APPROVE or REJECT recommendation with detailed reasoning. Format as Markdown.`;
    }

    /**
     * Reply to comments prompt (matches Python production reply-to-comments logic)
     */
    static getReplyToCommentsPrompt(prDetails, question) {
        const context = this.getBaseContext(prDetails);
        return `Reply to the following user comment about this pull request. ${this.FOCUS_INSTRUCTION} Provide a helpful, context-aware response.
Title: ${context.title}
Description: ${context.description}
Files changed: ${context.files_changed}
File Contents:
${context.file_contents}

**User Comment:** ${question}

Provide a detailed, helpful response based on the PR content. Format your response as Markdown.`;
    }
}

module.exports = { ProductionPrompts };
