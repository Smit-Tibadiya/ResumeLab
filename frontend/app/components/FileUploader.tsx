import { useCallback, useState } from "react"; // 1. Import useState
import { useDropzone } from "react-dropzone";
import { formatFileSize } from "~/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  // 2. Create our own local state to hold the file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setSelectedFile(file); // Save it to our local state
      onFileSelect?.(file);  // Send it up to the parent
    },
    [onFileSelect]
  );

  // 3. We no longer need 'acceptedFiles' from useDropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  // 4. Create a clean handler for removing the file
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null); // Clear our local state
    onFileSelect?.(null);  // Tell the parent it's cleared
  };

  return (
    <div className="w-full bg-white rounded-2xl p-5">
      <div
        {...getRootProps()}
        className={`transition-all duration-300 ${isDragActive ? "opacity-50 scale-[0.98]" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4 cursor-pointer">

          {selectedFile ? (
            <div className="flex uploader-selected-file" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <img src="/icons/pdf.svg" alt="pdf" className="size-25" />
              </div>

              <div className="flex flex-col justify-center items-center w-full">
                <p className="text-lg font-semibold text-[#0f766e] truncate max-w-xs mx-auto">
                  {selectedFile.name}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(selectedFile.size)} • Ready to analyze
                </p>
              </div>

              <button
                type="button"
                className="p-2 cursor-pointer hover:bg-red-50 rounded-full transition-colors"
                onClick={handleRemove}
              >
                <img src="/icons/cross.svg" className="w-8 h-8" alt="remove" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <img src="/icons/info.svg" alt="pdf" className="size-13 mb-4" />
              </div>
              <p className="text-lg text-[#334155]">
                <span className="font-semibold text-[#0f766e]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-sm text-gray-500 mt-1">PDF (max 20 MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;