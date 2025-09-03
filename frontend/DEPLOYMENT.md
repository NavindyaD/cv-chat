# GitHub Pages Deployment Guide

## Prerequisites
- Your code must be pushed to a GitHub repository
- The repository must be public (or you need GitHub Pro for private repos)

## Automatic Deployment (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy when you push to main/master branch

3. **Your site will be available at**:
   `https://[your-username].github.io/[repository-name]`

## Manual Deployment

If you prefer manual deployment:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **The built files will be in the `out/` directory**

3. **Upload the contents of `out/` directory to your GitHub Pages branch**

## Troubleshooting

- Make sure your repository is public
- Check the Actions tab for any build errors
- Ensure the `out/` directory contains your built files
- The `.nojekyll` file prevents Jekyll processing issues

## Notes

- The site will automatically rebuild and deploy on every push to main/master
- You can monitor deployment progress in the Actions tab
- The first deployment might take a few minutes
