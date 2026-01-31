# 🔧 Azure OpenAI Configuration Guide

This guide explains how to configure Azure OpenAI for use with the PR Agent extension.

---

## 🚀 How to Configure

### **Step 1: Set Up Pipeline Variables**

In your Azure DevOps pipeline, configure these variables:

```yaml
variables:
  # Your Azure OpenAI endpoint (the task auto-detects this format)
  PR_AGENT_API_ENDPOINT: 'https://your-resource.openai.azure.com/'
  
  # Your Azure OpenAI API key (mark as secret!)
  AZURE_OPENAI_API_KEY: 'your-azure-openai-api-key'
```

### **Step 2: Update Your Pipeline**

```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Code Review with Azure OpenAI'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(AZURE_OPENAI_API_KEY)'
    sourceDirectory: '$(Build.SourcesDirectory)'
    qualityThreshold: 80
    securityThreshold: 90
    outputFormat: 'junit'
    publishResults: true
```

### **Step 3: Ensure GPT-4 Deployment**

The task assumes you have a GPT-4 deployment named `gpt-4`. If your deployment has a different name, you'll need to update the endpoint in the task code or create a deployment named `gpt-4`.

## 📋 **Supported Analysis Types**

The task now provides intelligent prompts for each analysis type:

### **🔍 Code Review (`review`)**
- Code quality and maintainability
- Best practices adherence
- Potential bugs and issues
- Performance considerations
- Readability and documentation

### **🔒 Security Analysis (`security`)**
- Security vulnerabilities (OWASP Top 10)
- Sensitive data exposure
- Authentication and authorization issues
- Input validation problems
- Cryptographic issues

### **🚀 Improvement Suggestions (`improve`)**
- Code optimization opportunities
- Refactoring recommendations
- Design pattern improvements
- Performance enhancements
- Maintainability improvements

### **📋 Compliance Check (`compliance`)**
- Coding standards adherence
- Documentation requirements
- Naming conventions
- Code structure guidelines
- Team policies

## 🎯 **Expected Output**

The task will now return structured JSON responses with:

```json
{
  "summary": {
    "qualityScore": 85,
    "securityScore": 92,
    "issuesFound": 3,
    "suggestions": 5
  },
  "issues": [
    {
      "severity": "warning",
      "message": "Issue description",
      "file": "filename.js",
      "line": 42,
      "description": "Detailed explanation",
      "suggestion": "How to fix this"
    }
  ]
}
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Still Getting 404 Errors**
- Verify your Azure OpenAI endpoint URL is correct
- Ensure the endpoint includes `openai.azure.com`
- Check that your API key is valid and not expired

#### **Authentication Errors**
- Verify the API key is correctly set as a secret variable
- Ensure the Azure OpenAI resource has the correct permissions
- Check that the deployment exists and is active

#### **Token Limit Errors**
- The task limits file content to prevent token overflow
- Large files are automatically truncated
- Consider using file patterns to focus on specific files

#### **Deployment Not Found**
- Ensure you have a GPT-4 deployment named `gpt-4`
- Or modify the task code to use your deployment name

## 📊 **Performance Optimization**

### **File Filtering**
Use include/exclude patterns to focus analysis:

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'security'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(AZURE_OPENAI_API_KEY)'
    includePatterns: |
      src/**/*.js
      src/**/*.ts
      *.py
    excludePatterns: |
      node_modules/**
      dist/**
      *.test.js
      *.min.js
```

### **Analysis Scope**
- The task analyzes up to 5 files per request to stay within token limits
- Each file is truncated to 1500 characters to prevent overflow
- For larger codebases, consider running multiple focused analyses

---

## 📝 Complete Pipeline Example

Here's a complete example pipeline:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  PR_AGENT_API_ENDPOINT: 'https://your-resource.openai.azure.com/'
  AZURE_OPENAI_API_KEY: 'your-api-key'  # Mark as secret!

stages:
- stage: CodeAnalysis
  displayName: 'AI Code Analysis'
  jobs:
  - job: SecurityScan
    displayName: 'Security Analysis'
    steps:
    - task: DevOpsPRAgentAnalyze@1
      displayName: 'AI Security Scan'
      inputs:
        analysisType: 'security'
        apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
        apiKey: '$(AZURE_OPENAI_API_KEY)'
        securityThreshold: 95
        outputFormat: 'junit'
        publishResults: true
        
  - job: QualityReview
    displayName: 'Quality Review'
    steps:
    - task: DevOpsPRAgentAnalyze@1
      displayName: 'AI Code Review'
      inputs:
        analysisType: 'review'
        apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
        apiKey: '$(AZURE_OPENAI_API_KEY)'
        qualityThreshold: 85
        outputFormat: 'markdown'
        outputFile: '$(Agent.TempDirectory)/code-review.md'
```

---

*For more information, see the main [README](../README.md).*
