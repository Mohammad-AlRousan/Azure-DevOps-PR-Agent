# Azure DevOps PR Agent

🤖 **AI-powered code analysis and review for Azure DevOps pull requests**

Transform your code review process with intelligent AI analysis that provides comprehensive feedback on code quality, security, performance, and best practices.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Code Review** | Automated code quality analysis |
| 🚀 **Improvement Suggestions** | Performance optimization recommendations |
| 🧪 **Test Generation** | AI-generated test case suggestions |
| 📋 **Compliance Check** | Standards and documentation validation |
| 🔒 **Security Scan** | Vulnerability detection |
| ✅ **Auto-Approval** | Risk assessment for automated approval |
| 📝 **PR Description** | AI-generated PR descriptions |

## 🚀 Quick Start

### Step 1: Install the Extension

Install this extension to your Azure DevOps organization.

### Step 2: Add to Your Pipeline

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'all'
  env:
    AZURE_OPENAI_ENDPOINT: $(AZURE_OPENAI_ENDPOINT)
    AZURE_OPENAI_API_KEY: $(AZURE_OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(System.AccessToken)
```

### Step 3: Run Your Pipeline

The task will automatically analyze your pull request and post AI-generated comments.

## 📊 Analysis Types

| Type | Description |
|------|-------------|
| `describe` | Overall recommendations and PR description |
| `review` | Code quality and maintainability |
| `compliance` | Standards and documentation |
| `auto-approve` | Risk assessment for automated approval |
| `ask` | Interactive Q&A analysis |
| `improve` | Performance optimization opportunities |
| `tests` | Test coverage and quality evaluation |
| `security` | Vulnerability detection |
| `all` | Run all analysis types (creates separate comments) |

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI service endpoint |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_DEVOPS_PAT` | Azure DevOps Personal Access Token |

## 🔗 Links

- **GitHub**: [Azure-DevOps-PR-Agent](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent)
- **Issues**: [Report a bug](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent/issues)

## 📄 License

MIT License - see [LICENSE](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent/blob/main/LICENSE.md) for details.

---

*Powered by Azure OpenAI • Updated monthly with new features and bug fixes*

