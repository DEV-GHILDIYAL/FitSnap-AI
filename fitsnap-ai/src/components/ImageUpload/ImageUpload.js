"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./ImageUpload.module.css";

export default function ImageUpload({ label, description, icon, onImageSelect, accept = "image/*", externalPreview }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(externalPreview || null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (externalPreview !== undefined && externalPreview !== preview) {
      setPreview(externalPreview);
      setFileName(externalPreview ? "Preset Outfit" : "");
    }
  }, [externalPreview]);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onImageSelect?.(file, e.target.result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    onImageSelect?.(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span className={styles.icon}>{icon}</span>
        <div>
          <h3 className={styles.label}>{label}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${
          preview ? styles.hasPreview : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className={styles.hiddenInput}
          aria-hidden="true"
        />

        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt={`${label} preview`} className={styles.previewImage} />
            <div className={styles.previewOverlay}>
              <span className={styles.fileName}>{fileName}</span>
              <button className={styles.removeBtn} onClick={handleRemove} aria-label="Remove image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.uploadIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className={styles.uploadText}>
              <span className={styles.uploadHighlight}>Click to upload</span> or drag & drop
            </p>
            <p className={styles.uploadHint}>PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}

        {/* Animated border on drag */}
        {isDragging && <div className={styles.dragBorder} />}
      </div>
    </div>
  );
}
