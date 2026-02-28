# Azure DevOps PR Agent

🤖 **AI-powered code analysis and review for Azure DevOps pull requests**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Marketplace](https://img.shields.io/badge/Azure%20DevOps-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=DevOps-PR-Review.azdo-pr-agent)
[![GitHub](https://img.shields.io/badge/GitHub-Open%20Source-black?logo=github)](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-brightgreen)](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent/issues)

## 📦 Install from Marketplace

**[Get it on Azure DevOps Marketplace](https://marketplace.visualstudio.com/items?itemName=DevOps-PR-Review.azdo-pr-agent)**

> 🔄 **Monthly Updates**: The extension is updated monthly on the marketplace with new features and bug fixes.

---

## ⚠️ Disclaimer

> **Note:** I'm not very experienced with TypeScript, but with the help of AI agents, building this extension became much easier! This project might contain some bugs, and **I rely on community help to make it better**. Feel free to open issues, submit PRs, or suggest improvements!

---

## 🚀 What is this?

This Azure DevOps extension provides AI-powered code review and analysis for your pull requests. It uses Azure OpenAI to automatically analyze code changes and provide actionable feedback directly in your PRs.

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

---

## 🚀 Quick Start

### Step 1: Install the Extension

Install from the [Azure DevOps Marketplace](https://marketplace.visualstudio.com/items?itemName=DevOps-PR-Review.azdo-pr-agent).

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

### Analysis Types

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

---

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI service endpoint |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_DEVOPS_PAT` | Azure DevOps Personal Access Token (use `$(System.AccessToken)` for pipeline) |

---

## 🔧 Development

### Project Structure

```
├── tasks/              # Pipeline task implementation (main logic)
├── src/                # Web extension source code
├── static/             # Static assets
└── documents/          # Documentation
```

### Building Locally

```bash
npm install           # Install dependencies
npm run build         # Build the extension
npm run package       # Create VSIX package
```

---

## 🤝 Contributing

**All contributors are welcome!** This is an open source, community-driven project and we'd love your help to make it better.

Whether you're fixing a typo, improving documentation, squashing bugs, or adding new features — every contribution matters! 🎉

### How to Contribute

1. **Fork** the repository: [github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent)
2. **Create** a feature branch: `git checkout -b my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to your fork: `git push origin my-feature`
5. **Open** a Pull Request

### Areas Where Help is Needed

- 🐛 **Bug fixes** — Found a bug? Fix it and submit a PR!
- 📝 **Documentation** — Help us improve guides and examples
- ✨ **New features** — Have an idea? Let's discuss it!
- 🧪 **Testing** — Help improve test coverage
- 🔧 **Code quality** — TypeScript improvements welcome
- 🌍 **Translations** — Help localize the extension

> 💡 **First time contributing?** Look for issues labeled `good first issue`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Azure OpenAI Setup](documents/AZURE_OPENAI_SETUP.md) | How to configure Azure OpenAI |
| [Pipeline Task Guide](documents/PIPELINE_TASK_GUIDE.md) | Pipeline integration guide |
| [Publishing Guide](documents/PUBLISHING_GUIDE.md) | How to publish the extension |
| [Extension Documentation](documents/EXTENSION_DOCUMENTATION.md) | Full extension documentation |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- Built with help from AI coding assistants
- Powered by Azure OpenAI
- Thanks to all contributors!

---

**Found a bug?** [Open an issue](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent/issues) · **Have a suggestion?** [Start a discussion](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent/discussions) · **Want to contribute?** [Fork the repo](https://github.com/Mohammad-AlRousan/Azure-DevOps-PR-Agent/fork)
