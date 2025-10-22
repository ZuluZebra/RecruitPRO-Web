// Hiring Information Component - Complete with Document Management & Download
const HiringInfoTab = ({ currentUser, isOnline }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedRegion, setSelectedRegion] = React.useState('all');
    const [editingCountry, setEditingCountry] = React.useState(null);
    const [editingSection, setEditingSection] = React.useState(null);
    const [viewingDocument, setViewingDocument] = React.useState(null);
    const [hiringData, setHiringData] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [tempEditContent, setTempEditContent] = React.useState('');

    // Country definitions
    const countries = [
        { name: 'South Africa', code: 'ZA', flag: '🇿🇦', region: 'Africa' },
        { name: 'UAE', code: 'AE', flag: '🇦🇪', region: 'Middle East' },
        { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East' },
        { name: 'Bahrain', code: 'BH', flag: '🇧🇭', region: 'Middle East' },
        { name: 'Qatar', code: 'QA', flag: '🇶🇦', region: 'Middle East' },
        { name: 'Oman', code: 'OM', flag: '🇴🇲', region: 'Middle East' },
        { name: 'Kuwait', code: 'KW', flag: '🇰🇼', region: 'Middle East' },
        { name: 'Israel', code: 'IL', flag: '🇮🇱', region: 'Middle East' },
        { name: 'Portugal', code: 'PT', flag: '🇵🇹', region: 'Europe' },
        { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe' },
        { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe' },
        { name: 'Greece', code: 'GR', flag: '🇬🇷', region: 'Europe' },
        { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Europe' },
        { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe' },
        { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe' },
        { name: 'Netherlands', code: 'NL', flag: '🇳🇱', region: 'Europe' },
        { name: 'UK', code: 'GB', flag: '🇬🇧', region: 'Europe' },
        { name: 'Ireland', code: 'IE', flag: '🇮🇪', region: 'Europe' },
        { name: 'Finland', code: 'FI', flag: '🇫🇮', region: 'Europe' },
        { name: 'Sweden', code: 'SE', flag: '🇸🇪', region: 'Europe' },
        { name: 'Belgium', code: 'BE', flag: '🇧🇪', region: 'Europe' },
        { name: 'Morocco', code: 'MA', flag: '🇲🇦', region: 'Africa' },
        { name: 'Kenya', code: 'KE', flag: '🇰🇪', region: 'Africa' },
        { name: 'Nigeria', code: 'NG', flag: '🇳🇬', region: 'Africa' }
    ];

    // Initialize with demo data ONLY if no existing data
    React.useEffect(() => {
        loadExistingData();
    }, []);

    const loadExistingData = () => {
        setLoading(true);
        
        // Try to load existing hiring data from localStorage
        const existingData = localStorage.getItem('recruitpro_hiring_info');
        
        if (existingData) {
            try {
                const parsedData = JSON.parse(existingData);
                console.log('✅ Loaded existing hiring data:', Object.keys(parsedData).length, 'countries');
                setHiringData(parsedData);
                setLoading(false);
                return;
            } catch (error) {
                console.error('❌ Error parsing existing hiring data:', error);
            }
        }
        
        // Only initialize demo data if no existing data found
        console.log('📝 No existing data found, initializing demo data');
        initializeDemoData();
    };

    const saveHiringData = (newData) => {
        // Save to state
        setHiringData(newData);
        
        // Persist to localStorage
        try {
            localStorage.setItem('recruitpro_hiring_info', JSON.stringify(newData));
            console.log('✅ Hiring data saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving hiring data:', error);
        }
    };

    const initializeDemoData = () => {
        const demoData = {};
        countries.forEach(country => {
            demoData[country.code] = {
                internal_hiring: {
                    text_content: `Internal hiring guidelines for ${country.name}:\n\n• Standard allowances apply\n• Local tax implications\n• Visa requirements for transfers\n• Benefits package details`,
                    documents: [
                        {
                            id: `${country.code}_int_1`,
                            name: `${country.name}_Internal_Policy.pdf`,
                            type: 'pdf',
                            size: 245760,
                            upload_date: '2025-01-15',
                            viewable: true,
                            originalFile: null, // Demo document - no original file
                            preview: `INTERNAL HIRING POLICY - ${country.name}\n\n1. ALLOWANCES & BENEFITS\n   • Housing allowance: Based on local standards\n   • Transportation: Company car or allowance\n   • Healthcare: Full family coverage\n\n2. VISA & WORK PERMITS\n   • Processing time: 4-6 weeks\n   • Required documents: Passport, certificates\n   • Renewal: Annual process\n\n3. TAX IMPLICATIONS\n   • Local tax obligations\n   • Double taxation agreements\n   • Tax filing assistance provided\n\n4. ONBOARDING PROCESS\n   • Week 1: Documentation & setup\n   • Week 2: Local orientation\n   • Month 1: Performance check-in\n\nThis document contains comprehensive internal hiring policies and procedures for ${country.name}, including detailed guidelines on allowances, visa requirements, tax implications, and onboarding processes.\n\n⚠️  DEMO DOCUMENT: This is a sample document for demonstration purposes.`
                        }
                    ]
                },
                external_hiring: {
                    text_content: `External hiring guidelines for ${country.name}:\n\n• Market salary benchmarks\n• Local recruitment practices\n• Compliance requirements\n• Onboarding procedures`,
                    documents: [
                        {
                            id: `${country.code}_ext_1`,
                            name: `${country.name}_External_Guide.docx`,
                            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            size: 156800,
                            upload_date: '2025-01-10',
                            viewable: true,
                            originalFile: null, // Demo document - no original file
                            preview: `WORD DOCUMENT: ${country.name}_External_Guide.docx\n\n📄 DOCUMENT ANALYSIS\n═══════════════════════════════════\n\nFile Type: Microsoft Word Document\nFile Size: ${formatFileSize(156800)}\nUploaded: Demo Document\n\n📝 EXTRACTED CONTENT:\n${'-'.repeat(50)}\nEXTERNAL HIRING GUIDE - ${country.name.toUpperCase()}\n\n1. RECRUITMENT STRATEGY\nOur external hiring approach focuses on attracting top talent while ensuring compliance with local employment laws and cultural considerations.\n\n2. JOB POSTING REQUIREMENTS\n• Mandatory equal opportunity statements\n• Salary range disclosure (where legally required)\n• Clear job descriptions and qualifications\n• Application deadline specifications\n\n3. SCREENING AND ASSESSMENT\n• Initial CV review criteria\n• Phone/video screening protocols\n• Technical assessment guidelines\n• Cultural fit evaluation methods\n\n4. INTERVIEW PROCESS\n• Multi-stage interview structure\n• Panel composition requirements\n• Question banks by role type\n• Evaluation scoring matrices\n\n5. OFFER MANAGEMENT\n• Compensation benchmarking process\n• Negotiation parameters and limits\n• Contract terms and conditions\n• Onboarding timeline coordination\n${'-'.repeat(50)}\n\n⚠️  DEMO DOCUMENT:\nThis is a demonstration document with sample content.\nWhen you upload your own Word files, you'll see\nactual extracted text from your documents.\n\n💡 Upload a real Word document to see how the system\nparses and displays your actual content!`
                        }
                    ]
                }
            };
        });
        saveHiringData(demoData); // Use saveHiringData instead of setHiringData
        setLoading(false);
    };

    // Filter countries
    const filteredCountries = countries.filter(country => {
        const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = selectedRegion === 'all' || country.region === selectedRegion;
        return matchesSearch && matchesRegion;
    });

    const regions = ['all', ...new Set(countries.map(c => c.region))];

    // File management functions
    const formatFileSize = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileUpload = (countryCode, section, event) => {
        const files = Array.from(event.target.files);
        processFiles(countryCode, section, files);
        event.target.value = '';
    };

    const processFiles = (countryCode, section, files) => {
        files.forEach(async (file) => {
            const newDoc = {
                id: `${countryCode}_${section}_${Date.now()}`,
                name: file.name,
                type: file.type || file.name.split('.').pop(),
                size: file.size,
                upload_date: new Date().toISOString().split('T')[0],
                viewable: true,
                preview: 'Loading file content...',
                actualContent: null,
                originalFile: await fileToBase64(file) // Convert file to base64 for storage
            };

            // Read and parse file content based on type
            try {
                if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    // For Excel files, try to extract basic info + use SheetJS approach hint
                    const arrayBuffer = await file.arrayBuffer();
                    newDoc.actualContent = await parseExcelFileAdvanced(arrayBuffer, file.name, file);
                    newDoc.preview = newDoc.actualContent;
                } else if (file.type.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                    // For Word files, try to extract text + use mammoth approach hint
                    const arrayBuffer = await file.arrayBuffer();
                    newDoc.actualContent = await parseWordFileAdvanced(arrayBuffer, file.name, file);
                    newDoc.preview = newDoc.actualContent;
                } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
                    // Parse text files
                    const text = await file.text();
                    newDoc.actualContent = text;
                    newDoc.preview = text;
                } else {
                    // Default preview for other file types
                    newDoc.preview = `${file.name} - Recently uploaded document\n\nThis file was uploaded on ${new Date().toLocaleDateString()} and contains important hiring information for the ${section.replace('_', ' ')} process.\n\nFile details:\n• Name: ${file.name}\n• Size: ${formatFileSize(file.size)}\n• Type: ${file.type}\n• Upload date: ${new Date().toLocaleDateString()}\n\nThe document is now available for viewing and download by all authorized team members.`;
                }
            } catch (error) {
                console.error('Error parsing file:', error);
                newDoc.preview = `Error loading file content for ${file.name}.\n\nFile details:\n• Name: ${file.name}\n• Size: ${formatFileSize(file.size)}\n• Type: ${file.type}\n• Upload date: ${new Date().toLocaleDateString()}\n\nThere was an issue parsing this file. You can still download it using the download button.`;
            }
            
            // Update hiringData and persist to localStorage
            const updatedData = {
                ...hiringData,
                [countryCode]: {
                    ...hiringData[countryCode],
                    [section]: {
                        ...hiringData[countryCode][section],
                        documents: [...hiringData[countryCode][section].documents, newDoc]
                    }
                }
            };
            saveHiringData(updatedData);
        });
    };

    // Helper function to convert file to base64 for storage
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Convert base64 back to file for download
    const base64ToFile = (base64Data, filename) => {
        const arr = base64Data.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // Advanced Excel parser - attempts to show actual content
    const parseExcelFileAdvanced = async (arrayBuffer, fileName, originalFile) => {
        try {
            let content = `📊 EXCEL CONTENT: ${fileName}\n`;
            content += `${'═'.repeat(60)}\n\n`;

            // Try to extract actual spreadsheet content
            // Note: This is a simplified approach. Production would use SheetJS
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Look for shared strings (Excel stores text separately)
            let extractedStrings = [];
            let extractedNumbers = [];
            
            // Convert binary to string and look for readable content
            const decoder = new TextDecoder('utf-8', { fatal: false });
            let textContent = '';
            
            // Process in chunks to avoid memory issues
            for (let i = 0; i < Math.min(arrayBuffer.byteLength, 50000); i += 1000) {
                const chunk = uint8Array.slice(i, i + 1000);
                const chunkText = decoder.decode(chunk);
                textContent += chunkText;
            }
            
            // Extract meaningful strings (3+ chars with letters)
            const stringMatches = textContent.match(/[A-Za-z][A-Za-z0-9\s]{2,30}/g) || [];
            extractedStrings = [...new Set(stringMatches)]
                .filter(str => 
                    str.length >= 3 && 
                    str.length <= 30 &&
                    /[aeiou]/i.test(str) && // Must contain vowels
                    !/^[A-Z\s]+$/.test(str) && // Not all caps
                    !str.includes('�') // No replacement characters
                )
                .slice(0, 20);
            
            // Extract numbers (could be data values)
            const numberMatches = textContent.match(/\b\d{1,10}(\.\d{1,4})?\b/g) || [];
            extractedNumbers = [...new Set(numberMatches)]
                .map(num => parseFloat(num))
                .filter(num => !isNaN(num) && num > 0 && num < 1000000)
                .slice(0, 15);
            
            content += `📋 EXTRACTED SPREADSHEET DATA:\n`;
            content += `${'-'.repeat(50)}\n`;
            
            if (extractedStrings.length > 0) {
                content += `📝 TEXT CONTENT FOUND:\n`;
                extractedStrings.slice(0, 10).forEach(str => {
                    content += `• ${str.trim()}\n`;
                });
                content += `\n`;
            }
            
            if (extractedNumbers.length > 0) {
                content += `🔢 NUMERIC VALUES FOUND:\n`;
                // Try to format numbers nicely
                const sortedNumbers = extractedNumbers.sort((a, b) => b - a);
                sortedNumbers.slice(0, 12).forEach(num => {
                    if (num > 1000) {
                        content += `• ${num.toLocaleString()}\n`;
                    } else {
                        content += `• ${num}\n`;
                    }
                });
                content += `\n`;
            }
            
            if (extractedStrings.length === 0 && extractedNumbers.length === 0) {
                content += `⚠️  Could not extract readable content from this Excel file.\n`;
                content += `The file may be:\n`;
                content += `• Password protected\n`;
                content += `• Heavily formatted with complex structures\n`;
                content += `• Using newer Excel format features\n\n`;
            }
            
            content += `${'-'.repeat(50)}\n\n`;
            content += `💡 VIEWING RECOMMENDATION:\n`;
            content += `For complete data, formulas, charts, and formatting:\n`;
            content += `1. Click "Download" to get the original Excel file\n`;
            content += `2. Open in Microsoft Excel, Google Sheets, or LibreOffice\n`;
            content += `3. View all worksheets, pivot tables, and calculations\n\n`;
            
            content += `🔧 TECHNICAL INFO:\n`;
            content += `File size: ${formatFileSize(arrayBuffer.byteLength)}\n`;
            content += `Format: Excel Open XML (.xlsx)\n`;
            content += `Upload date: ${new Date().toLocaleDateString()}\n`;
            content += `Parsed content: ${extractedStrings.length} text items, ${extractedNumbers.length} numbers`;
            
            return content;
        } catch (error) {
            return `❌ Error parsing Excel file: ${fileName}\n\nError details: ${error.message}\n\nPlease download the file to view it in Excel.`;
        }
    };

    // Advanced Word parser - attempts to show actual content
    const parseWordFileAdvanced = async (arrayBuffer, fileName, originalFile) => {
        try {
            let content = `📄 WORD CONTENT: ${fileName}\n`;
            content += `${'═'.repeat(60)}\n\n`;

            // Try to extract actual document content
            // Note: This is a simplified approach. Production would use mammoth.js
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Convert binary and look for readable text
            const decoder = new TextDecoder('utf-8', { fatal: false });
            let fullText = '';
            
            // Process file in chunks
            for (let i = 0; i < Math.min(arrayBuffer.byteLength, 100000); i += 2000) {
                const chunk = uint8Array.slice(i, i + 2000);
                const chunkText = decoder.decode(chunk);
                fullText += chunkText;
            }
            
            // Extract sentences and paragraphs
            let extractedSentences = [];
            const sentenceMatches = fullText.match(/[A-Z][^.!?]*[.!?]/g) || [];
            
            extractedSentences = sentenceMatches
                .filter(sentence => 
                    sentence.length > 10 && 
                    sentence.length < 200 &&
                    /[aeiou]/i.test(sentence) && // Must contain vowels
                    !sentence.includes('�') && // No replacement characters
                    sentence.split(' ').length > 3 // At least 4 words
                )
                .slice(0, 15);
            
            // Extract words that might be headings or key terms
            const wordMatches = fullText.match(/\b[A-Z][A-Za-z\s]{3,25}\b/g) || [];
            const keyTerms = [...new Set(wordMatches)]
                .filter(term => 
                    term.length >= 4 && 
                    term.length <= 25 &&
                    /^[A-Z]/.test(term) && // Starts with capital
                    term.split(' ').length <= 4 // Not too many words
                )
                .slice(0, 10);
            
            content += `📖 EXTRACTED DOCUMENT CONTENT:\n`;
            content += `${'-'.repeat(50)}\n`;
            
            if (keyTerms.length > 0) {
                content += `🏷️  KEY TERMS/HEADINGS:\n`;
                keyTerms.forEach(term => {
                    content += `• ${term.trim()}\n`;
                });
                content += `\n`;
            }
            
            if (extractedSentences.length > 0) {
                content += `📝 DOCUMENT TEXT:\n`;
                extractedSentences.forEach((sentence, index) => {
                    const cleanSentence = sentence.replace(/[^\w\s.,!?()-]/g, '').trim();
                    if (cleanSentence.length > 15) {
                        content += `${index + 1}. ${cleanSentence}\n\n`;
                    }
                });
            }
            
            if (extractedSentences.length === 0 && keyTerms.length === 0) {
                content += `⚠️  Could not extract readable text from this Word document.\n`;
                content += `The document may be:\n`;
                content += `• Password protected\n`;
                content += `• Heavily formatted with images/tables\n`;
                content += `• Using complex document features\n`;
                content += `• In an older Word format\n\n`;
            }
            
            content += `${'-'.repeat(50)}\n\n`;
            content += `💡 VIEWING RECOMMENDATION:\n`;
            content += `For complete formatting, images, tables, and layout:\n`;
            content += `1. Click "Download" to get the original Word document\n`;
            content += `2. Open in Microsoft Word, Google Docs, or LibreOffice\n`;
            content += `3. View with full formatting, images, and structure\n\n`;
            
            content += `🔧 TECHNICAL INFO:\n`;
            content += `File size: ${formatFileSize(arrayBuffer.byteLength)}\n`;
            content += `Format: Word Open XML (.docx)\n`;
            content += `Upload date: ${new Date().toLocaleDateString()}\n`;
            content += `Extracted: ${keyTerms.length} key terms, ${extractedSentences.length} sentences`;
            
            return content;
        } catch (error) {
            return `❌ Error parsing Word document: ${fileName}\n\nError details: ${error.message}\n\nPlease download the file to view it in Word.`;
        }
    };

    // Drag and drop handlers
    const [draggedOver, setDraggedOver] = React.useState(null);

    const handleDragOver = (e, countryCode, section) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOver(`${countryCode}_${section}`);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only clear if we're leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDraggedOver(null);
        }
    };

    const handleDrop = (e, countryCode, section) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOver(null);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFiles(countryCode, section, files);
        }
    };

    const downloadDocument = async (doc) => {
        try {
            let fileToDownload = null;
            let suggestedName = doc.name;

            // Check if we have the original file stored as base64
            if (doc.originalFile && typeof doc.originalFile === 'string') {
                // Convert base64 back to file
                fileToDownload = base64ToFile(doc.originalFile, doc.name);
            } else if (doc.originalFile && doc.originalFile instanceof File) {
                // Direct file object (shouldn't happen with persistence, but just in case)
                fileToDownload = doc.originalFile;
            }

            // Check if the browser supports the File System Access API (for choosing download location)
            if ('showSaveFilePicker' in window && fileToDownload) {
                let acceptTypes = {};

                // Set up file type filters based on file type
                if (doc.type.includes('spreadsheet') || doc.name.endsWith('.xlsx')) {
                    acceptTypes = { 'Excel Files': ['.xlsx', '.xls'], 'All Files': ['*'] };
                } else if (doc.type.includes('document') || doc.name.endsWith('.docx')) {
                    acceptTypes = { 'Word Documents': ['.docx', '.doc'], 'All Files': ['*'] };
                } else if (doc.type.startsWith('text/')) {
                    acceptTypes = { 'Text Files': ['.txt', '.csv'], 'All Files': ['*'] };
                } else {
                    acceptTypes = { 'All Files': ['*'] };
                }

                try {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: suggestedName,
                        types: [{
                            description: Object.keys(acceptTypes)[0],
                            accept: { '*/*': Object.values(acceptTypes)[0] }
                        }]
                    });

                    const writable = await fileHandle.createWritable();
                    await writable.write(fileToDownload);
                    await writable.close();

                    setTimeout(() => {
                        alert(`✅ Downloaded: ${suggestedName}\n\n📁 Saved to your chosen location!\n\n💡 Original format preserved.`);
                    }, 100);

                    return; // Exit early if successful
                } catch (error) {
                    if (error.name === 'AbortError') {
                        return; // User cancelled
                    }
                    console.warn('Save picker failed, falling back to standard download:', error);
                }
            }

            // Fallback: Standard browser download
            const element = document.createElement('a');
            
            if (fileToDownload) {
                // Download the original file
                const url = URL.createObjectURL(fileToDownload);
                element.href = url;
                element.download = suggestedName;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                URL.revokeObjectURL(url);
                
                setTimeout(() => {
                    alert(`✅ Downloaded: ${suggestedName}\n\n📁 Downloaded to your default Downloads folder.\n\n💡 Original format preserved.`);
                }, 100);
            } else {
                // Fallback for demo documents or if original file is missing
                const content = doc.actualContent || doc.preview || `Document: ${doc.name}\nSize: ${formatFileSize(doc.size)}\nUpload Date: ${doc.upload_date}\n\nThis is a demonstration document.`;
                const fileName = doc.name.replace(/\.[^/.]+$/, '') + '_content.txt';
                
                const file = new Blob([content], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = fileName;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                URL.revokeObjectURL(element.href);
                
                setTimeout(() => {
                    alert(`✅ Downloaded: ${fileName}\n\n📁 Downloaded to your default Downloads folder.\n\nNote: This is a demo document or original file was missing.`);
                }, 100);
            }

        } catch (error) {
            console.error('Download failed:', error);
            alert(`❌ Download failed: ${error.message}\n\nPlease try again or contact support.`);
        }
    };

    const deleteDocument = (countryCode, section, docId) => {
        if (confirm('Are you sure you want to delete this document?')) {
            setHiringData(prev => ({
                ...prev,
                [countryCode]: {
                    ...prev[countryCode],
                    [section]: {
                        ...prev[countryCode][section],
                        documents: prev[countryCode][section].documents.filter(doc => doc.id !== docId)
                    }
                }
            }));
        }
    };

    const startEditing = (countryCode, section) => {
        setEditingCountry(countryCode);
        setEditingSection(section);
        setTempEditContent(hiringData[countryCode][section].text_content);
    };

    const saveEdit = () => {
        setHiringData(prev => ({
            ...prev,
            [editingCountry]: {
                ...prev[editingCountry],
                [editingSection]: {
                    ...prev[editingCountry][editingSection],
                    text_content: tempEditContent
                }
            }
        }));
        setEditingCountry(null);
        setEditingSection(null);
        setTempEditContent('');
    };

    const cancelEdit = () => {
        setEditingCountry(null);
        setEditingSection(null);
        setTempEditContent('');
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                fontSize: '18px',
                color: 'var(--text-secondary)'
            }}>
                Loading hiring information...
            </div>
        );
    }

    return (
        <div style={{ 
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '24px'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🌍 Global Hiring Information
                    </h1>
                    <div style={{
                        background: '#f8fafc',
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b'
                    }}>
                        {filteredCountries.length} Countries
                    </div>
                </div>

                {/* Search and Filter */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                background: '#ffffff'
                            }}
                        />
                    </div>
                    
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        style={{
                            padding: '12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '14px',
                            outline: 'none',
                            background: '#ffffff',
                            minWidth: '150px'
                        }}
                    >
                        {regions.map(region => (
                            <option key={region} value={region}>
                                {region === 'all' ? 'All Regions' : region}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Countries Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '24px'
            }}>
                {filteredCountries.map(country => (
                    <div key={country.code} style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        {/* Country Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            padding: '20px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                                {country.flag}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                {country.name}
                            </h3>
                            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                                {country.region}
                            </div>
                        </div>

                        {/* Internal Hiring Section */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🏢 Internal Hiring
                                </h4>
                                <button
                                    onClick={() => startEditing(country.code, 'internal_hiring')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '8px',
                                        color: '#64748b',
                                        fontSize: '14px'
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                            </div>

                            {editingCountry === country.code && editingSection === 'internal_hiring' ? (
                                <div style={{ marginBottom: '16px' }}>
                                    <textarea
                                        value={tempEditContent}
                                        onChange={(e) => setTempEditContent(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '12px',
                                            border: '2px solid #667eea',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            outline: 'none'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            onClick={saveEdit}
                                            style={{
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            💾 Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    color: '#475569',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {hiringData[country.code]?.internal_hiring?.text_content}
                                </div>
                            )}

                            {/* Documents Section */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>
                                        Documents ({hiringData[country.code]?.internal_hiring?.documents?.length || 0})
                                    </span>
                                    <label style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        📤 Upload
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileUpload(country.code, 'internal_hiring', e)}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                {/* Drag and Drop Zone */}
                                <div
                                    onDragOver={(e) => handleDragOver(e, country.code, 'internal_hiring')}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, country.code, 'internal_hiring')}
                                    style={{
                                        border: draggedOver === `${country.code}_internal_hiring` 
                                            ? '2px dashed #3b82f6' 
                                            : '2px dashed #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        textAlign: 'center',
                                        background: draggedOver === `${country.code}_internal_hiring` 
                                            ? 'rgba(59, 130, 246, 0.05)' 
                                            : '#fafafa',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ 
                                        fontSize: '24px', 
                                        color: draggedOver === `${country.code}_internal_hiring` ? '#3b82f6' : '#94a3b8',
                                        marginBottom: '8px'
                                    }}>
                                        📁
                                    </div>
                                    <div style={{ 
                                        fontSize: '13px', 
                                        color: draggedOver === `${country.code}_internal_hiring` ? '#3b82f6' : '#64748b',
                                        fontWeight: draggedOver === `${country.code}_internal_hiring` ? '600' : '400'
                                    }}>
                                        {draggedOver === `${country.code}_internal_hiring` 
                                            ? 'Drop files here to upload' 
                                            : 'Drag & drop files here or click Upload button'
                                        }
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {hiringData[country.code]?.internal_hiring?.documents?.map(doc => (
                                        <div key={doc.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '16px' }}>
                                                    {doc.type.includes('spreadsheet') || doc.name.endsWith('.xlsx') || doc.name.endsWith('.xls') ? '📊' : 
                                                     doc.type.includes('document') || doc.name.endsWith('.docx') || doc.name.endsWith('.doc') ? '📄' : 
                                                     doc.type.startsWith('text') || doc.name.endsWith('.txt') || doc.name.endsWith('.csv') ? '📝' : 
                                                     doc.type === 'pdf' || doc.name.endsWith('.pdf') ? '📋' : '📁'}
                                                </span>
                                                <div>
                                                    <div style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {doc.name}
                                                        {(doc.type.includes('spreadsheet') || doc.name.endsWith('.xlsx') || 
                                                          doc.type.includes('document') || doc.name.endsWith('.docx') ||
                                                          doc.type.startsWith('text')) && (
                                                            <span style={{
                                                                background: '#10b981',
                                                                color: 'white',
                                                                padding: '1px 4px',
                                                                borderRadius: '3px',
                                                                fontSize: '9px',
                                                                fontWeight: '600'
                                                            }}>
                                                                VIEWABLE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {formatFileSize(doc.size)} • {doc.upload_date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => setViewingDocument(doc)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        color: '#3b82f6',
                                                        fontSize: '16px'
                                                    }}
                                                    title="View document"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => downloadDocument(doc)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        color: '#10b981',
                                                        fontSize: '16px'
                                                    }}
                                                    title="Download document"
                                                >
                                                    💾
                                                </button>
                                                <button
                                                    onClick={() => deleteDocument(country.code, 'internal_hiring', doc.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        color: '#ef4444',
                                                        fontSize: '16px'
                                                    }}
                                                    title="Delete document"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* External Hiring Section */}
                        <div style={{ padding: '20px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px'
                            }}>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🌐 External Hiring
                                </h4>
                                <button
                                    onClick={() => startEditing(country.code, 'external_hiring')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '8px',
                                        color: '#64748b',
                                        fontSize: '14px'
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                            </div>

                            {editingCountry === country.code && editingSection === 'external_hiring' ? (
                                <div style={{ marginBottom: '16px' }}>
                                    <textarea
                                        value={tempEditContent}
                                        onChange={(e) => setTempEditContent(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '12px',
                                            border: '2px solid #667eea',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            outline: 'none'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            onClick={saveEdit}
                                            style={{
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            💾 Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    color: '#475569',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {hiringData[country.code]?.external_hiring?.text_content}
                                </div>
                            )}

                            {/* Documents Section */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>
                                        Documents ({hiringData[country.code]?.external_hiring?.documents?.length || 0})
                                    </span>
                                    <label style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        📤 Upload
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileUpload(country.code, 'external_hiring', e)}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                {/* Drag and Drop Zone */}
                                <div
                                    onDragOver={(e) => handleDragOver(e, country.code, 'external_hiring')}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, country.code, 'external_hiring')}
                                    style={{
                                        border: draggedOver === `${country.code}_external_hiring` 
                                            ? '2px dashed #3b82f6' 
                                            : '2px dashed #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        textAlign: 'center',
                                        background: draggedOver === `${country.code}_external_hiring` 
                                            ? 'rgba(59, 130, 246, 0.05)' 
                                            : '#fafafa',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ 
                                        fontSize: '24px', 
                                        color: draggedOver === `${country.code}_external_hiring` ? '#3b82f6' : '#94a3b8',
                                        marginBottom: '8px'
                                    }}>
                                        📁
                                    </div>
                                    <div style={{ 
                                        fontSize: '13px', 
                                        color: draggedOver === `${country.code}_external_hiring` ? '#3b82f6' : '#64748b',
                                        fontWeight: draggedOver === `${country.code}_external_hiring` ? '600' : '400'
                                    }}>
                                        {draggedOver === `${country.code}_external_hiring` 
                                            ? 'Drop files here to upload' 
                                            : 'Drag & drop files here or click Upload button'
                                        }
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {hiringData[country.code]?.external_hiring?.documents?.map(doc => (
                                        <div key={doc.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '16px' }}>
                                                    {doc.type.includes('spreadsheet') || doc.name.endsWith('.xlsx') || doc.name.endsWith('.xls') ? '📊' : 
                                                     doc.type.includes('document') || doc.name.endsWith('.docx') || doc.name.endsWith('.doc') ? '📄' : 
                                                     doc.type.startsWith('text') || doc.name.endsWith('.txt') || doc.name.endsWith('.csv') ? '📝' : 
                                                     doc.type === 'pdf' || doc.name.endsWith('.pdf') ? '📋' : '📁'}
                                                </span>
                                                <div>
                                                    <div style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {doc.name}
                                                        {(doc.type.includes('spreadsheet') || doc.name.endsWith('.xlsx') || 
                                                          doc.type.includes('document') || doc.name.endsWith('.docx') ||
                                                          doc.type.startsWith('text')) && (
                                                            <span style={{
                                                                background: '#10b981',
                                                                color: 'white',
                                                                padding: '1px 4px',
                                                                borderRadius: '3px',
                                                                fontSize: '9px',
                                                                fontWeight: '600'
                                                            }}>
                                                                VIEWABLE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {formatFileSize(doc.size)} • {doc.upload_date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => setViewingDocument(doc)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        color: '#3b82f6',
                                                        fontSize: '16px'
                                                    }}
                                                    title="View document"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => downloadDocument(doc)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        color: '#10b981',
                                                        fontSize: '16px'
                                                    }}
                                                    title="Download document"
                                                >
                                                    💾
                                                </button>
                                                <button
                                                    onClick={() => deleteDocument(country.code, 'external_hiring', doc.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        color: '#ef4444',
                                                        fontSize: '16px'
                                                    }}
                                                    title="Delete document"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '0',
                        maxWidth: '90vw',
                        width: '800px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            background: '#f8fafc'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                                    {viewingDocument.name}
                                </h3>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    {formatFileSize(viewingDocument.size)} • {viewingDocument.upload_date}
                                    <span style={{ 
                                        background: '#10b981', 
                                        color: 'white', 
                                        padding: '2px 8px', 
                                        borderRadius: '12px', 
                                        marginLeft: '8px',
                                        fontSize: '10px',
                                        fontWeight: '600'
                                    }}>
                                        ✓ VIEWABLE
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingDocument(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    color: '#64748b',
                                    fontSize: '18px'
                                }}
                            >
                                ❌
                            </button>
                        </div>
                        
                        {/* Document Content */}
                        <div style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '24px',
                            fontFamily: viewingDocument.type.includes('spreadsheet') ? 'Monaco, Consolas, monospace' : 
                                      viewingDocument.type.includes('document') || viewingDocument.name.endsWith('.docx') ? 'Georgia, serif' : 
                                      'Monaco, Consolas, monospace',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: '#374151',
                            background: viewingDocument.type.includes('spreadsheet') ? '#f8fffe' : 
                                      viewingDocument.type.includes('document') || viewingDocument.name.endsWith('.docx') ? '#fefffe' : 
                                      '#fafafa',
                            whiteSpace: 'pre-line'
                        }}>
                            {/* File type indicator */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '16px',
                                padding: '8px 12px',
                                background: viewingDocument.type.includes('spreadsheet') ? '#dcfdf7' : 
                                          viewingDocument.type.includes('document') || viewingDocument.name.endsWith('.docx') ? '#dbeafe' : 
                                          '#f3f4f6',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                <span style={{ fontSize: '16px' }}>
                                    {viewingDocument.type.includes('spreadsheet') || viewingDocument.name.endsWith('.xlsx') ? '📊' : 
                                     viewingDocument.type.includes('document') || viewingDocument.name.endsWith('.docx') ? '📄' : 
                                     viewingDocument.type.startsWith('text') ? '📝' : '📁'}
                                </span>
                                <span style={{ color: '#374151' }}>
                                    {viewingDocument.type.includes('spreadsheet') || viewingDocument.name.endsWith('.xlsx') ? 'EXCEL SPREADSHEET' : 
                                     viewingDocument.type.includes('document') || viewingDocument.name.endsWith('.docx') ? 'WORD DOCUMENT' : 
                                     viewingDocument.type.startsWith('text') ? 'TEXT FILE' : 'DOCUMENT FILE'}
                                </span>
                                <span style={{ 
                                    background: '#10b981', 
                                    color: 'white', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px' 
                                }}>
                                    PARSED CONTENT
                                </span>
                            </div>
                            
                            {viewingDocument.preview}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                📄 {viewingDocument.type.toUpperCase()} Document
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => downloadDocument(viewingDocument)}
                                    style={{
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    💾 Download
                                </button>
                                <button
                                    onClick={() => setViewingDocument(null)}
                                    style={{
                                        background: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Export to global scope
window.HiringInfoTab = HiringInfoTab;