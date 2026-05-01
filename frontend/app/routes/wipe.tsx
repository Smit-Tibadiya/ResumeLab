import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const WipeApp = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);

    const loadFiles = async () => {
        const files = [];
        for (let i = 0; i < localStorage.length; i++){
            const key = localStorage.key(i);
            if(key && key.startsWith(`resume_`)) {
                const item = localStorage.getItem(key);
                if (item) {
                    files.push(JSON.parse(item));
                }
            }
        }
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);


    const handleDelete = async () => {
        files.forEach(async (file) => {
            await localStorage.removeItem(`resume_${file.id}`);
        });
        loadFiles();
    };

    return (
        <div>
            <div>Existing files:</div>
            <div className="flex flex-col gap-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;