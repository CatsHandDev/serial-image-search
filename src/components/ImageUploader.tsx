import { useState } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { storage, db } from "../firebase";
import { User } from "firebase/auth";

interface ImageUploaderProps {
  user: User;
}

export const ImageUploader = ({ user }: ImageUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [productCode, setProductCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidProductCode = (code: string) => /^\d{6}$/.test(code);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "image/jpeg") {
        setError("JPG形式の画像ファイルのみアップロード可能です。");
        setFile(null);
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("ファイルを選択してください。");
      return;
    }

    if (!isValidProductCode(productCode)) {
      setError("製品コードは6桁の数字で入力してください。");
      return;
    }

    setIsUploading(true);

    try {
      // ファイル名（拡張子を除く）を取得
      const fullName = file.name;           // 例: M003.jpg
      const baseFileName = fullName.replace(/\.[^/.]+$/, ""); // "M003"

      // アップロード先のパス
      const filePath = `images/${baseFileName}.jpg`;
      const fileRef = ref(storage, filePath);

      // アップロード
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // Firestore の参照
      const partDocRef = doc(db, "parts", productCode);
      const partDocSnap = await getDoc(partDocRef);

      const dataToUpdate = {
        fileName: baseFileName,
        imageUrl: downloadURL,
        uploadedBy: user.uid,
        uploadedAt: serverTimestamp(),
      };

      if (partDocSnap.exists()) {
        // ドキュメントが存在する場合は更新
        await updateDoc(partDocRef, dataToUpdate);
      } else {
        // 存在しなければ新規作成
        await setDoc(partDocRef, dataToUpdate);
      }

      setSuccess("画像のアップロードに成功しました。");
      setFile(null);
      setProductCode("");

      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("アップロードエラー:", err);
      setError("アップロード中にエラーが発生しました。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="uploader-container">
      <h2>図面画像のアップロード</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="productCode">製品コード（6桁の数字）</label>
          <input
            id="productCode"
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="例: 123456"
            maxLength={6}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="file-input">JPG画像を選択（ファイル名はM003など）</label>
          <input
            id="file-input"
            type="file"
            accept=".jpg,image/jpeg"
            onChange={handleFileChange}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button
          type="submit"
          className="upload-button"
          disabled={isUploading || !file || !productCode}
        >
          {isUploading ? "アップロード中..." : "アップロード"}
        </button>
      </form>
    </div>
  );
};
