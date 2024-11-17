import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileX, Copy, Check, FileUp } from 'lucide-react';

const FileViewer = () => {
  const [files, setFiles] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  const getFileFormat = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const formatMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'xml': 'xml',
      'swift': 'swift',
    };
    return formatMap[ext] || 'plaintext';
  };

  const formatContent = (content) => {
    try {
      // Try to detect if it's JSON
      const jsonTest = JSON.parse(content);
      return JSON.stringify(jsonTest, null, 2);
    } catch {
      // If not JSON, return as is but ensure consistent line endings
      return content.replace(/\r\n/g, '\n');
    }
  };

  const handleCopy = useCallback(async (content, format, fileName) => {
    try {
      const formattedContent = `\`\`\`${format}\n${content}\n\`\`\``;
      await navigator.clipboard.writeText(formattedContent);
      
      if (fileName) {
        setCopiedStates(prev => ({ ...prev, [fileName]: true }));
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [fileName]: false }));
        }, 2000);
      } else {
        setAllCopied(true);
        setTimeout(() => setAllCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const copyAllFiles = useCallback(async () => {
    const allContent = files.map(file => 
      `${file.name}\n\n\`\`\`${file.format}\n${formatContent(file.content)}\n\`\`\`\n`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(allContent);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy all:', error);
    }
  }, [files]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const fileContents = [];

    for (const file of droppedFiles) {
      try {
        const content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(file);
        });

        const format = getFileFormat(file.name);
        fileContents.push({
          name: file.name,
          content: content,
          format: format
        });
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    setFiles(prev => [...prev, ...fileContents]);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const FileTypeIcon = ({ format }) => {
    const iconColors = {
      javascript: 'text-yellow-500',
      typescript: 'text-blue-500',
      python: 'text-green-500',
      json: 'text-gray-500',
      html: 'text-orange-500',
      css: 'text-blue-400',
      markdown: 'text-purple-500',
      swift: 'text-orange-600',
      plaintext: 'text-gray-400'
    };

    return (
      <div className={`text-xs font-mono ${iconColors[format] || 'text-gray-400'}`}>
        {format}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">File Content Viewer</h1>
        <p className="text-gray-600">
          Drop your files below to view and copy their contents with proper formatting
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${files.length === 0 ? 'h-64' : 'h-40'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <FileUp 
            size={32} 
            className={`${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop your files here' : 'Drag & drop your files here'}
            </p>
            <p className="text-xs text-gray-500">
              Supports code files (.js, .py, .swift, .json, etc.) and text files
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Files ({files.length})
            </h2>
            {files.length > 1 && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={copyAllFiles}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 
                    hover:bg-blue-100 rounded-md transition-colors"
                >
                  {allCopied ? (
                    <>
                      <Check size={14} />
                      <span>Copied all!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy all</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {files.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <FileTypeIcon format={file.format} />
                      <h3 className="text-sm font-medium text-gray-800">{file.name}</h3>
                      <span className="text-xs text-gray-500">
                        ({(file.content.length / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <FileX size={18} />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code className={`language-${file.format}`}>
                        {formatContent(file.content)}
                      </code>
                    </pre>
                    <button
                      onClick={() => handleCopy(
                        formatContent(file.content),
                        file.format,
                        file.name
                      )}
                      className="absolute top-2 right-2 p-2 rounded-md bg-white/90 hover:bg-white 
                        shadow-sm border transition-all hover:shadow-md"
                      aria-label="Copy content"
                    >
                      {copiedStates[file.name] ? (
                        <div className="flex items-center space-x-1">
                          <Check size={14} className="text-green-500" />
                          <span className="text-xs text-green-500">Copied!</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Copy size={14} className="text-gray-500" />
                          <span className="text-xs text-gray-500">Copy with format</span>
                        </div>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
