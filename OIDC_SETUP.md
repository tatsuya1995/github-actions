# GitHub Actions OIDC Setup Guide

このガイドでは、AWS コンソールで手動でGitHub Actions用のOIDC設定を行う手順を説明します。

## 1. IAM Identity Provider の作成

1. **AWS Console > IAM > Identity providers** に移動
2. **Add provider** をクリック
3. 以下の設定を入力：
   - **Provider type**: OpenID Connect
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
4. **Get thumbprint** をクリック（自動で取得されます）
5. **Add provider** をクリック

## 2. IAM Role の作成

1. **AWS Console > IAM > Roles** に移動
2. **Create role** をクリック
3. **Web identity** を選択
4. 以下の設定を入力：
   - **Identity provider**: 上記で作成したGitHub provider
   - **Audience**: `sts.amazonaws.com`
5. **Next** をクリック
6. **Permissions policies** で以下のポリシーをアタッチ：
   - `PowerUserAccess` (本番環境では最小権限を推奨)
7. **Next** をクリック
8. **Role details** を入力：
   - **Role name**: `GitHubActionsRole`
   - **Description**: `Role for GitHub Actions OIDC`
9. **Create role** をクリック

## 3. Trust Policy の編集

作成したロールの Trust Policy を以下のように編集します：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_AWS_ACCOUNT:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

**重要**: 
- `YOUR_AWS_ACCOUNT` を実際のAWSアカウントIDに置換
- `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` を実際のGitHubリポジトリに置換

## 4. GitHub Secrets の設定

1. GitHubリポジトリの **Settings > Secrets and variables > Actions** に移動
2. **New repository secret** をクリック
3. 以下のシークレットを作成：
   - **Name**: `AWS_ROLE_ARN`
   - **Value**: `arn:aws:iam::YOUR_AWS_ACCOUNT:role/GitHubActionsRole`

## 5. ワークフローで使用

既に作成済みの `.github/workflows/deploy.yml` がそのまま使用できます。

## セキュリティのベストプラクティス

- **最小権限の原則**: `PowerUserAccess` ではなく、必要な権限のみを付与
- **リポジトリの制限**: Trust Policy でリポジトリを明確に指定
- **ブランチの制限**: 必要に応じて特定のブランチのみに制限

例：main ブランチのみに制限する場合
```json
"token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:ref:refs/heads/main"
```
