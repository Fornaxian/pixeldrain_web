# Contributing to Pixeldrain Web

Thank you for your interest in contributing to Pixeldrain Web! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- Go 1.24 or higher
- Node.js and npm (for Svelte compilation)
- Git

### Setting Up the Development Environment

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Fornaxian/pixeldrain_web.git
   cd pixeldrain_web
   ```

2. **Run the development server:**
   ```bash
   make run
   ```
   This command will:
   - Start the Go backend server on http://127.0.0.1:8081
   - Compile and hot-reload Svelte components in the background

3. **Alternatively, build the project:**
   ```bash
   make build
   ```

### Understanding the Project Structure

- `main.go` - Entry point for the web server
- `webcontroller/` - Web controller logic
- `svelte/` - Frontend Svelte components
- `res/` - Static resources and markdown files
- `init/` - Initialization code

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Your environment (OS, Go version, Node.js version)

### Suggesting Enhancements

We welcome feature requests! Please create an issue with:
- A clear description of the enhancement
- Use cases and benefits
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository** and create a new branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow the existing code style
   - Write clear, descriptive commit messages
   - Keep changes focused and atomic

3. **Test your changes:**
   - Ensure the development server runs without errors
   - Test both backend (Go) and frontend (Svelte) changes
   - Verify your changes don't break existing functionality

4. **Compile Svelte components:**
   ```bash
   cd svelte && npm run build
   ```

5. **Submit a pull request:**
   - Provide a clear description of the changes
   - Reference any related issues
   - Wait for review and address feedback

## Development Guidelines

### Go Code

- Follow standard Go formatting (`gofmt`)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and reasonably sized

### Svelte/Frontend Code

- Follow the existing component structure
- Ensure components are reusable where appropriate
- Test UI changes in the browser
- Maintain responsive design principles

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Keep the first line under 72 characters
- Add detailed description if needed

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Review existing issues and pull requests
- Check the project's README.md

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (AGPL-3.0).

Thank you for contributing to Pixeldrain Web!
