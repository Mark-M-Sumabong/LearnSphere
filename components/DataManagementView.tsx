import React, { useState } from 'react';
import { Course } from '../types';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileJsonIcon } from './icons/FileJsonIcon';

interface DataManagementViewProps {
    activeCourse: Course | null;
    onImportCourse: (course: Course) => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({ activeCourse, onImportCourse }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setImportError(null);
        setImportSuccess(null);
        setPreviewCourse(null);
        setFile(null);

        if (!selectedFile) return;

        if (selectedFile.type !== 'application/json') {
            setImportError('Invalid file type. Please upload a JSON file.');
            return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsedData = JSON.parse(content);

                if (parsedData.title && parsedData.description && Array.isArray(parsedData.modules) && parsedData.modules.every((m: any) => m.title && Array.isArray(m.lessons))) {
                    setPreviewCourse(parsedData);
                } else {
                    throw new Error('Invalid JSON structure. The file does not appear to be a valid course.');
                }
            } catch (err: any) {
                setImportError(err.message || 'Failed to read or parse the JSON file.');
            }
        };
        reader.onerror = () => {
             setImportError('An error occurred while reading the file.');
        };
        reader.readAsText(selectedFile);
    };

    const handleConfirmImport = () => {
        if (previewCourse) {
            setImportSuccess(`Successfully imported course: "${previewCourse.title}". The application will now load the new course.`);
            // A short delay so the user can see the message before the UI re-renders
            setTimeout(() => {
                onImportCourse(previewCourse);
            }, 2000);
        }
    };

    const downloadFile = (content: string, fileName: string, contentType: string) => {
        const a = document.createElement("a");
        const fileBlob = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(fileBlob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    const handleExportJSON = () => {
        if (!activeCourse) return;
        const jsonContent = JSON.stringify(activeCourse, null, 2);
        const fileName = `${activeCourse.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        downloadFile(jsonContent, fileName, 'application/json');
        setExportSuccess(`Successfully exported "${activeCourse.title}" as JSON.`);
        setTimeout(() => setExportSuccess(null), 3000);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UploadIcon className="w-6 h-6 text-indigo-400" /> Import Course from JSON</h3>
                <p className="text-sm text-gray-400 mb-4">Upload a course file in JSON format. This will replace the currently active course for you.</p>
                
                <input type="file" id="course-upload" className="hidden" accept=".json,application/json" onChange={handleFileChange} />
                <label htmlFor="course-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition duration-200">
                    <UploadIcon className="w-5 h-5"/>
                    {file ? 'Change File' : 'Select File'}
                </label>
                {file && <span className="ml-4 text-gray-400">{file.name}</span>}

                {importError && (
                    <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md flex items-center gap-3 animate-fade-in">
                        <AlertTriangleIcon className="w-6 h-6" />
                        <p>{importError}</p>
                    </div>
                )}

                {importSuccess && (
                     <div className="mt-4 bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-md flex items-center gap-3 animate-fade-in">
                        <CheckCircleIcon className="w-6 h-6" />
                        <p>{importSuccess}</p>
                    </div>
                )}

                {previewCourse && !importSuccess && (
                    <div className="mt-6 border-t border-gray-700 pt-6 animate-fade-in">
                        <h4 className="text-lg font-semibold text-white mb-3">File Preview</h4>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 flex items-start gap-4">
                            <FileJsonIcon className="w-10 h-10 text-indigo-300 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-white">{previewCourse.title}</p>
                                <p className="text-sm text-gray-400 mb-2">{previewCourse.description}</p>
                                <p className="text-sm text-gray-300">
                                    <strong className="font-semibold">{previewCourse.modules.length}</strong> modules, with a total of <strong className="font-semibold">{previewCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</strong> lessons.
                                </p>
                            </div>
                        </div>
                        <button onClick={handleConfirmImport} className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200">
                            Confirm and Import Course
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><DownloadIcon className="w-6 h-6 text-indigo-400" /> Export Active Course</h3>
                 {activeCourse ? (
                    <div>
                         <p className="text-sm text-gray-400 mb-4">Export the current course <strong className="text-white">"{activeCourse.title}"</strong> as a JSON file.</p>
                         <button onClick={handleExportJSON} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200">
                            <DownloadIcon className="w-5 h-5"/>
                             Export as JSON
                         </button>
                         {exportSuccess && (
                            <div className="mt-4 bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-md flex items-center gap-3 animate-fade-in">
                                <CheckCircleIcon className="w-6 h-6" />
                                <p>{exportSuccess}</p>
                            </div>
                        )}
                    </div>
                 ) : (
                    <p className="text-gray-400">No active course to export. Please generate or import a course first.</p>
                 )}
            </div>
        </div>
    );
};
