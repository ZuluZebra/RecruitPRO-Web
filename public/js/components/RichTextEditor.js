// FIXED Rich Text Editor Component
// Replace your existing js/components/RichTextEditor.js with this

const RichTextEditor = ({ 
    value,           // Support both 'value' and 'content' props
    content,         // for backward compatibility
    onChange, 
    placeholder = "Enter your feedback...",
    minHeight = "150px",
    className = ""
}) => {
    const editorRef = React.useRef(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const isUpdatingRef = React.useRef(false);
    
    // Support both 'value' and 'content' props
    const currentValue = value !== undefined ? value : content;

    // ✅ FIXED: Better content synchronization
    React.useEffect(() => {
        if (editorRef.current && currentValue !== undefined) {
            const currentContent = editorRef.current.innerHTML;
            const newValue = currentValue || '';
            
            // Only update if content is different AND we're not currently editing
            if (newValue !== currentContent && !isUpdatingRef.current && !isFocused) {
                console.log('🔄 RichTextEditor: Setting content to:', newValue);
                editorRef.current.innerHTML = newValue;
            }
        }
    }, [currentValue]); // ✅ Removed isFocused dependency to prevent clearing

    // ✅ FIXED: Improved input handler
    const handleInput = () => {
        if (editorRef.current && onChange && !isUpdatingRef.current) {
            isUpdatingRef.current = true;
            const newContent = editorRef.current.innerHTML;
            console.log('📝 RichTextEditor: Content changed to:', newContent);
            onChange(newContent);
            
            // Reset flag immediately 
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 10);
        }
    };

    // ✅ FIXED: Better focus handling
    const handleFocus = () => {
        setIsFocused(true);
        console.log('👁️ RichTextEditor: Focused');
    };

    const handleBlur = () => {
        setIsFocused(false);
        console.log('👁️ RichTextEditor: Blurred');
        // Trigger a final save on blur
        setTimeout(() => {
            if (editorRef.current && onChange) {
                onChange(editorRef.current.innerHTML);
            }
        }, 10);
    };

    // Toolbar commands
    const executeCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        handleInput(); // Update parent component
    };

    // Toolbar button component
    const ToolbarButton = ({ onClick, title, children, isActive = false }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            style={{
                background: isActive ? 'var(--accent-color)' : 'var(--input-bg)',
                color: isActive ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                height: '36px'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.target.style.background = 'var(--accent-color)';
                    e.target.style.color = 'white';
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.target.style.background = 'var(--input-bg)';
                    e.target.style.color = 'var(--text-primary)';
                }
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            border: `2px solid ${isFocused ? 'var(--accent-color)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            background: 'var(--input-bg)',
            transition: 'all 0.3s ease',
            boxShadow: isFocused ? '0 0 0 4px rgba(102, 126, 234, 0.1)' : 'none'
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '12px',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '10px 10px 0 0'
            }}>
                <ToolbarButton
                    onClick={() => executeCommand('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <strong>B</strong>
                </ToolbarButton>
                
                <ToolbarButton
                    onClick={() => executeCommand('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <em>I</em>
                </ToolbarButton>
                
                <ToolbarButton
                    onClick={() => executeCommand('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <u>U</u>
                </ToolbarButton>

                <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                
                <ToolbarButton
                    onClick={() => executeCommand('insertUnorderedList')}
                    title="Bullet List"
                >
                    •
                </ToolbarButton>
                
                <ToolbarButton
                    onClick={() => executeCommand('insertOrderedList')}
                    title="Numbered List"
                >
                    1.
                </ToolbarButton>

                <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                
                <ToolbarButton
                    onClick={() => executeCommand('justifyLeft')}
                    title="Align Left"
                >
                    ⬅
                </ToolbarButton>
                
                <ToolbarButton
                    onClick={() => executeCommand('justifyCenter')}
                    title="Align Center"
                >
                    ↔
                </ToolbarButton>

                <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                
                <ToolbarButton
                    onClick={() => executeCommand('insertHTML', '<hr style="margin: 10px 0; border: none; border-top: 2px solid var(--border-color);">')}
                    title="Insert Divider"
                >
                    ―
                </ToolbarButton>
                
                <ToolbarButton
                    onClick={() => executeCommand('removeFormat')}
                    title="Clear Formatting"
                >
                    ✕
                </ToolbarButton>
            </div>

            {/* ✅ FIXED: Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={className}
                style={{
                    minHeight,
                    maxHeight: '400px',
                    overflow: 'auto',
                    resize: 'vertical',
                    padding: '15px 20px',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    borderRadius: '0 0 10px 10px',
                    fontFamily: 'inherit'
                }}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
            />
        </div>
    );
};

// Export component
window.RichTextEditor = RichTextEditor;