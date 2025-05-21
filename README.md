# タキロン図面サーチ - Firebase認証と画像アップロード機能

## 概要
このアプリケーションは、タキロン製品の図面を6桁の商品コードから検索できる便利なツールです。
最新の実装では、Firebase認証とStorageを統合し、認証済みユーザーのみが図面画像をアップロードできる機能を追加しました。

## 機能
- 商品コードによる図面検索（認証不要）
- Firebase認証（Eメール/パスワード）
- 認証済みユーザーによる図面画像のアップロード
- FirebaseのStorageとFirestoreを使用したデータ管理

## 環境構築

### 前提条件
- Node.js (v14以上)
- npm または yarn
- Firebaseプロジェクト

### Firebase設定
1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
2. Authentication機能を有効化し、Eメール/パスワード認証を設定
3. Cloud StorageとFirestoreを有効化
4. Storageのセキュリティルールを設定（下記参照）
5. Firestoreのセキュリティルールを設定（下記参照）

### インストール手順
1. 必要なパッケージをインストール:
   ```bash
   npm install firebase
   # または
   yarn add firebase
   ```

2. `.env.example`ファイルを`.env`にコピーし、Firebaseプロジェクトの情報で更新:
   ```bash
   cp .env.example .env
   ```

3. `.env`ファイルにFirebaseの設定値を入力

### Firebaseセキュリティルール

#### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      // 読み取りは誰でも可能
      allow read: if true;
      // 書き込みは認証済みユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```

#### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /images/{imageId} {
      // 読み取りは誰でも可能
      allow read: if true;
      // 書き込みは認証済みユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```

## 起動方法
```bash
npm run dev
# または
yarn dev
```

## 管理者ユーザーの作成
1. アプリケーションを起動
2. 「管理者ログイン」ボタンをクリック
3. 「登録」リンクをクリック
4. メールアドレスとパスワードを入力して登録

## 画像のアップロード方法
1. 管理者としてログイン
2. ユーザーメニューから「画像アップロード」を選択
3. 製品コード（6桁）を入力
4. JPG形式の図面画像を選択
5. 「アップロード」ボタンをクリック

## デプロイ方法
Firebase Hostingを使用してデプロイする場合:

1. Firebase CLIをインストール:
   ```bash
   npm install -g firebase-tools
   ```

2. Firebaseにログイン:
   ```bash
   firebase login
   ```

3. プロジェクトの初期化:
   ```bash
   firebase init
   ```
   - Hostingを選択
   - ビルドディレクトリに `dist` を指定

4. アプリケーションをビルド:
   ```bash
   npm run build
   # または
   yarn build
   ```

5. デプロイ:
   ```bash
   firebase deploy
   ```

## 注意事項
- 本アプリケーションは参考用です。本番環境で使用する場合は、セキュリティ対策を十分に行ってください。
- Firebaseの無料プランには利用制限があります。大量のデータ処理や頻繁なアクセスがある場合は、有料プランへのアップグレードを検討してください。