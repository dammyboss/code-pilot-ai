const styles = `
<style>
    body {
        font-family: var(--vscode-font-family);
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        margin: 0;
        padding: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .header {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        background-color: transparent;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header h2 {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-foreground);
        letter-spacing: -0.2px;
        opacity: 0.9;
    }

    .controls {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .btn {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: 1px solid var(--vscode-panel-border);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 400;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .btn:hover {
        background-color: var(--vscode-button-background);
        border-color: var(--vscode-focusBorder);
    }

    .btn.outlined {
        background-color: transparent;
        color: var(--vscode-foreground);
        border-color: var(--vscode-panel-border);
    }

    .btn.outlined:hover {
        background-color: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-focusBorder);
    }

    .btn.stop {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: 400;
        opacity: 0.7;
    }

    .btn.stop:hover {
        background-color: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
        border-color: rgba(231, 76, 60, 0.3);
        opacity: 1;
    }

    /* Permission Request */
    .permission-request {
        margin: 4px 12px 20px 12px;
        background-color: var(--vscode-inputValidation-warningBackground);
        border: 1px solid var(--vscode-inputValidation-warningBorder);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: slideUp 0.3s ease;
    }

    .permission-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .permission-header .icon {
        font-size: 16px;
    }

    .permission-menu {
        position: relative;
        margin-left: auto;
    }

    .permission-menu-btn {
        background: none;
        border: none;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.2s ease;
        line-height: 1;
    }

    .permission-menu-btn:hover {
        background-color: var(--vscode-list-hoverBackground);
        color: var(--vscode-foreground);
    }

    .permission-menu-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: var(--vscode-menu-background);
        border: 1px solid var(--vscode-menu-border);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 220px;
        padding: 4px 0;
        margin-top: 4px;
    }

    .permission-menu-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 16px;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        color: var(--vscode-foreground);
        transition: background-color 0.2s ease;
    }

    .permission-menu-item:hover {
        background-color: var(--vscode-list-hoverBackground);
    }

    .permission-menu-item .menu-icon {
        font-size: 16px;
        margin-top: 1px;
        flex-shrink: 0;
    }

    .permission-menu-item .menu-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .permission-menu-item .menu-title {
        font-weight: 500;
        font-size: 13px;
        line-height: 1.2;
    }

    .permission-menu-item .menu-subtitle {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.8;
        line-height: 1.2;
    }

    .permission-content {
        font-size: 13px;
        line-height: 1.4;
        color: var(--vscode-descriptionForeground);
    }



    .permission-tool {
        font-family: var(--vscode-editor-font-family);
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        padding: 8px 10px;
        margin: 8px 0;
        font-size: 12px;
        color: var(--vscode-editor-foreground);
    }

    .permission-buttons {
        margin-top: 2px;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .permission-buttons .btn {
        font-size: 12px;
        padding: 6px 12px;
        min-width: 70px;
        text-align: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 28px;
        border-radius: 4px;
        border: 1px solid;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        box-sizing: border-box;
    }

    .permission-buttons .btn.allow {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border-color: var(--vscode-button-background);
    }

    .permission-buttons .btn.allow:hover {
        background-color: var(--vscode-button-hoverBackground);
    }

    .permission-buttons .btn.deny {
        background-color: transparent;
        color: var(--vscode-foreground);
        border-color: var(--vscode-panel-border);
    }

    .permission-buttons .btn.deny:hover {
        background-color: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-focusBorder);
    }

    .permission-buttons .btn.always-allow {
        background-color: rgba(0, 122, 204, 0.1);
        color: var(--vscode-charts-blue);
        border-color: rgba(0, 122, 204, 0.3);
        font-weight: 500;
        min-width: auto;
        padding: 6px 14px;
        height: 28px;
    }

    .permission-buttons .btn.always-allow:hover {
        background-color: rgba(0, 122, 204, 0.2);
        border-color: rgba(0, 122, 204, 0.5);
        transform: translateY(-1px);
    }

    .permission-buttons .btn.always-allow code {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: var(--vscode-editor-font-family);
        font-size: 11px;
        color: var(--vscode-editor-foreground);
        margin-left: 4px;
        display: inline;
        line-height: 1;
        vertical-align: baseline;
    }

    .permission-decision {
        font-size: 13px;
        font-weight: 600;
        padding: 8px 12px;
        text-align: center;
        border-radius: 4px;
        margin-top: 8px;
    }

    .permission-decision.allowed {
        background-color: rgba(0, 122, 204, 0.15);
        color: var(--vscode-charts-blue);
        border: 1px solid rgba(0, 122, 204, 0.3);
    }

    .permission-decision.denied {
        background-color: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }

    .permission-decided {
        opacity: 0.7;
        pointer-events: none;
    }

    .permission-decided .permission-buttons {
        display: none;
    }

    .permission-decided.allowed {
        border-color: var(--vscode-inputValidation-infoBackground);
        background-color: rgba(0, 122, 204, 0.1);
    }

    .permission-decided.denied {
        border-color: var(--vscode-inputValidation-errorBorder);
        background-color: var(--vscode-inputValidation-errorBackground);
    }

    /* Permissions Management */
    .permissions-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        background-color: var(--vscode-input-background);
        margin-top: 8px;
    }

    .permission-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 6px;
        padding-right: 6px;
        border-bottom: 1px solid var(--vscode-panel-border);
        transition: background-color 0.2s ease;
        min-height: 32px;
    }

    .permission-item:hover {
        background-color: var(--vscode-list-hoverBackground);
    }

    .permission-item:last-child {
        border-bottom: none;
    }

    .permission-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-grow: 1;
        min-width: 0;
    }

    .permission-tool {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
        height: 18px;
        display: inline-flex;
        align-items: center;
        line-height: 1;
        /* Default colors */
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: #ffffff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    /* Colorful tool-specific badges */
    .permission-tool[data-tool="Bash"] {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .permission-tool[data-tool="Grep"] {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .permission-tool[data-tool="Read"] {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .permission-tool[data-tool="Edit"] {
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    }

    .permission-tool[data-tool="Write"] {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .permission-tool[data-tool="MultiEdit"] {
        background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
    }

    .permission-tool[data-tool="Glob"] {
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    }

    .permission-tool[data-tool="LS"] {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }

    .permission-tool[data-tool="WebSearch"] {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    }

    .permission-tool[data-tool="WebFetch"] {
        background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
    }

    .permission-command {
        font-size: 12px;
        color: var(--vscode-foreground);
        flex-grow: 1;
    }

    .permission-command code {
        background-color: var(--vscode-textCodeBlock-background);
        padding: 3px 6px;
        border-radius: 3px;
        font-family: var(--vscode-editor-font-family);
        color: var(--vscode-textLink-foreground);
        font-size: 11px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        line-height: 1;
    }

    .permission-desc {
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
        font-style: italic;
        flex-grow: 1;
        height: 18px;
        display: inline-flex;
        align-items: center;
        line-height: 1;
    }

    .permission-remove-btn {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: none;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s ease;
        font-weight: 500;
        flex-shrink: 0;
        opacity: 0.7;
    }

    .permission-remove-btn:hover {
        background-color: rgba(231, 76, 60, 0.1);
        color: var(--vscode-errorForeground);
        opacity: 1;
    }

    .permissions-empty {
        padding: 16px;
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-style: italic;
        font-size: 13px;
    }

    .permissions-empty::before {
        content: "🔒";
        display: block;
        font-size: 16px;
        margin-bottom: 8px;
        opacity: 0.5;
    }

    /* Add Permission Form */
    .permissions-add-section {
        margin-top: 6px;
    }

    .permissions-show-add-btn {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 6px 8px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 400;
        opacity: 0.7;
    }

    .permissions-show-add-btn:hover {
        background-color: var(--vscode-list-hoverBackground);
        opacity: 1;
    }

    .permissions-add-form {
        margin-top: 8px;
        padding: 12px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        background-color: var(--vscode-input-background);
        animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .permissions-form-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
    }

    .permissions-tool-select {
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 12px;
        min-width: 100px;
        height: 24px;
        flex-shrink: 0;
    }

    .permissions-command-input {
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 12px;
        flex-grow: 1;
        height: 24px;
        font-family: var(--vscode-editor-font-family);
    }

    .permissions-command-input::placeholder {
        color: var(--vscode-input-placeholderForeground);
    }

    .permissions-add-btn {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 3px;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        height: 24px;
        font-weight: 500;
        flex-shrink: 0;
    }

    .permissions-add-btn:hover {
        background-color: var(--vscode-button-hoverBackground);
    }

    .permissions-add-btn:disabled {
        background-color: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        cursor: not-allowed;
        opacity: 0.5;
    }

    .permissions-cancel-btn {
        background-color: transparent;
        color: var(--vscode-foreground);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        height: 24px;
        font-weight: 500;
    }

    .permissions-cancel-btn:hover {
        background-color: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-focusBorder);
    }

    .permissions-form-hint {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        font-style: italic;
        line-height: 1.3;
    }

    .yolo-mode-section {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
        opacity: 1;
        transition: opacity 0.2s ease;
    }

    .yolo-mode-section:hover {
        opacity: 1;
    }

    .yolo-mode-section input[type="checkbox"] {
        transform: scale(0.9);
        margin: 0;
    }

    .yolo-mode-section label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        font-weight: 400;
    }

    /* New Permissions UI Styles */
    .permissions-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
    }

    .yolo-mode-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        margin-bottom: 20px;
        transition: all 0.2s ease;
    }

    .yolo-mode-card:hover {
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .yolo-mode-icon {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 8px;
        color: white;
    }

    .yolo-mode-content {
        flex: 1;
        min-width: 0;
    }

    .yolo-mode-title {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 2px;
    }

    .yolo-mode-description {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
    }

    .yolo-mode-toggle {
        flex-shrink: 0;
    }

    .toggle-checkbox {
        display: none;
    }

    .toggle-label {
        display: block;
        width: 44px;
        height: 24px;
        background: var(--vscode-input-background);
        border: 2px solid var(--vscode-panel-border);
        border-radius: 12px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .toggle-label::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: var(--vscode-descriptionForeground);
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .toggle-checkbox:checked + .toggle-label {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: #10b981;
    }

    .toggle-checkbox:checked + .toggle-label::after {
        transform: translateX(20px);
        background: white;
    }

    .permissions-section {
        margin-top: 16px;
    }

    .permissions-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .permissions-add-btn-new {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 500;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .permissions-add-btn-new:hover {
        background: var(--vscode-button-hoverBackground);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .permissions-add-form-new {
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-focusBorder);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .add-form-content .form-field {
        margin-bottom: 12px;
    }

    .permissions-tool-select-new,
    .permissions-command-input-new {
        width: 100%;
        padding: 8px 10px;
        font-size: 11px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        outline: none;
        transition: border-color 0.2s ease;
    }

    .permissions-tool-select-new:focus,
    .permissions-command-input-new:focus {
        border-color: var(--vscode-focusBorder);
    }

    .permissions-form-hint-new {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        padding: 8px 10px;
        background: var(--vscode-textBlockQuote-background);
        border-left: 3px solid var(--vscode-textBlockQuote-border);
        border-radius: 4px;
        margin-bottom: 12px;
        line-height: 1.5;
    }

    .permissions-form-hint-new code {
        background: var(--vscode-textCodeBlock-background);
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 10px;
    }

    .add-form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    .btn-cancel,
    .btn-confirm {
        padding: 7px 16px;
        font-size: 11px;
        font-weight: 500;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
    }

    .btn-cancel:hover {
        background: var(--vscode-button-secondaryHoverBackground);
    }

    .btn-confirm {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
    }

    .btn-confirm:hover {
        background: var(--vscode-button-hoverBackground);
    }

    .btn-confirm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .permissions-list-new {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .permissions-empty-new {
        text-align: center;
        padding: 60px 20px;
        color: var(--vscode-descriptionForeground);
    }

    .permission-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        transition: all 0.2s ease;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .permission-card:hover {
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    .permission-card-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border-radius: 6px;
        color: white;
    }

    .permission-card-content {
        flex: 1;
        min-width: 0;
    }

    .permission-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        flex-wrap: wrap;
    }

    .permission-tool-badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #ffffff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .permission-tool-badge[data-tool="Bash"] {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .permission-tool-badge[data-tool="Grep"] {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .permission-tool-badge[data-tool="Read"] {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .permission-tool-badge[data-tool="Edit"] {
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    }

    .permission-tool-badge[data-tool="Write"] {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .permission-tool-badge[data-tool="MultiEdit"] {
        background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
    }

    .permission-tool-badge[data-tool="Glob"] {
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    }

    .permission-tool-badge[data-tool="LS"] {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }

    .permission-tool-badge[data-tool="WebSearch"] {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    }

    .permission-tool-badge[data-tool="WebFetch"] {
        background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
    }

    .permission-scope-badge {
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 9px;
        font-weight: 500;
        background: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .permission-scope-badge-specific {
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 9px;
        font-weight: 500;
        background: var(--vscode-textBlockQuote-background);
        color: var(--vscode-descriptionForeground);
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .permission-card-description {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
    }

    .permission-command-code {
        font-family: var(--vscode-editor-font-family);
        background: var(--vscode-textCodeBlock-background);
        padding: 3px 6px;
        border-radius: 3px;
        font-size: 10px;
        color: var(--vscode-editor-foreground);
    }

    .permission-remove-btn-new {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        cursor: pointer;
        color: var(--vscode-errorForeground);
        transition: all 0.2s ease;
    }

    .permission-remove-btn-new:hover {
        background: var(--vscode-inputValidation-errorBackground);
        border-color: var(--vscode-errorForeground);
        transform: scale(1.1);
    }

    /* WSL Alert */
    .wsl-alert {
        margin: 8px 12px;
        background-color: rgba(135, 206, 235, 0.1);
        border: 2px solid rgba(135, 206, 235, 0.3);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(4px);
        animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .wsl-alert-content {
        display: flex;
        align-items: center;
        padding: 14px 18px;
        gap: 14px;
    }

    .wsl-alert-icon {
        font-size: 22px;
        flex-shrink: 0;
    }

    .wsl-alert-text {
        flex: 1;
        font-size: 13px;
        line-height: 1.4;
        color: var(--vscode-foreground);
    }

    .wsl-alert-text strong {
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .wsl-alert-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
    }

    .wsl-alert-actions .btn {
        padding: 6px 14px;
        font-size: 12px;
        border-radius: 6px;
    }

    .wsl-alert-actions .btn:first-child {
        background-color: rgba(135, 206, 235, 0.2);
        border-color: rgba(135, 206, 235, 0.4);
    }

    .wsl-alert-actions .btn:first-child:hover {
        background-color: rgba(135, 206, 235, 0.3);
        border-color: rgba(135, 206, 235, 0.6);
    }

    .chat-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .messages {
        flex: 1;
        padding: 16px 20px;
        overflow-y: auto;
        font-family: var(--vscode-font-family);
        font-size: 13px;
        line-height: 1.6;
        scroll-behavior: smooth;
    }

    .message {
        margin-bottom: 16px;
        padding: 0;
        max-width: 100%;
        animation: messageSlideIn 0.2s ease-out;
    }

    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .message.user {
        background: rgba(255, 255, 255, 0.06);
        color: var(--vscode-editor-foreground);
        font-family: var(--vscode-font-family);
        padding: 12px 16px;
        margin-left: 0;
        border-radius: 6px;
        border: none;
        position: relative;
    }

    .message.user .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        color: var(--vscode-descriptionForeground);
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    .message.user:hover .copy-btn {
        opacity: 0.7;
    }

    .message.user .copy-btn:hover {
        opacity: 1;
        color: var(--vscode-foreground);
        background: rgba(255, 255, 255, 0.05);
    }

    .message.claude {
        background: transparent;
        border: none;
        color: var(--vscode-editor-foreground);
        padding: 12px 0;
        position: relative;
    }

    .message.claude .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        color: var(--vscode-descriptionForeground);
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    .message.claude:hover .copy-btn {
        opacity: 0.7;
    }

    .message.claude .copy-btn:hover {
        opacity: 1;
        color: var(--vscode-foreground);
        background: rgba(255, 255, 255, 0.05);
    }

    .message.error {
        background: transparent;
        border: none;
        border-left: 2px solid rgba(239, 68, 68, 0.6);
        border-radius: 0;
        padding: 12px 16px;
        color: var(--vscode-editor-foreground);
        max-width: 100%;
    }

    .message.error .message-header {
        color: rgba(239, 68, 68, 0.9);
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Modern Error Card Styles */
    .message.error-card {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 0;
        margin: 12px;
        max-width: calc(100% - 24px);
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
    }

    .error-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: rgba(239, 68, 68, 0.1);
        border-bottom: 1px solid rgba(239, 68, 68, 0.15);
    }

    .error-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(239, 68, 68, 0.15);
        border-radius: 8px;
        color: #ef4444;
    }

    .error-label {
        flex: 1;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #ef4444;
    }

    .error-copy-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 6px;
        color: rgba(239, 68, 68, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .error-copy-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.4);
    }

    .error-card-content {
        padding: 16px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--vscode-foreground);
    }

    .error-card-content p {
        margin: 0 0 8px 0;
    }

    .error-card-content p:last-child {
        margin-bottom: 0;
    }

    .error-card-content pre {
        background: rgba(0, 0, 0, 0.2);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 12px;
        margin: 8px 0;
    }

    .message.system {
        background: transparent;
        color: var(--vscode-descriptionForeground);
        font-style: normal;
        font-size: 12px;
        max-width: 100%;
        text-align: center;
        margin: 16px auto;
        padding: 8px 16px;
        opacity: 0.7;
    }

    .message.tool {
        background: transparent;
        border: none;
        border-left: 2px solid rgba(147, 112, 219, 0.5);
        border-radius: 0;
        padding: 10px 16px;
        color: var(--vscode-editor-foreground);
        max-width: 100%;
        font-size: 12px;
    }

    .message.tool .message-header {
        color: rgba(147, 112, 219, 0.9);
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .message.tool-result {
        background: transparent;
        border: none;
        border-left: 2px solid rgba(34, 197, 94, 0.5);
        border-radius: 0;
        padding: 10px 16px;
        color: var(--vscode-editor-foreground);
        font-family: var(--vscode-editor-font-family);
        font-size: 12px;
        white-space: pre-wrap;
        max-width: 100%;
    }

    .message.thinking {
        background: transparent;
        border: none;
        border-left: 2px solid rgba(168, 85, 247, 0.4);
        border-radius: 0;
        padding: 10px 16px;
        color: var(--vscode-descriptionForeground);
        font-family: var(--vscode-font-family);
        font-style: italic;
        font-size: 12px;
        opacity: 0.9;
        margin-left: 0;
        margin-right: auto;
        max-width: 100%;
    }

    .tool-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tool-icon {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: linear-gradient(135deg, #7c8bed 0%, #5d6fe1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: 600;
        flex-shrink: 0;
        margin-left: 6px;
    }

    .tool-info {
        font-weight: 500;
        font-size: 13px;
        color: var(--vscode-editor-foreground);
        opacity: 0.9;
    }

    .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        position: relative;
    }

    .copy-btn {
        background: transparent;
        border: none;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        padding: 2px;
        border-radius: 3px;
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .message:hover .copy-btn {
        opacity: 0.7;
    }

    .copy-btn:hover {
        opacity: 1;
        background-color: var(--vscode-list-hoverBackground);
    }

    .message-icon {
        width: 18px;
        height: 18px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: 600;
        flex-shrink: 0;
        margin-left: 6px;
    }

    .message-icon.user {
        background: linear-gradient(135deg, #40a5ff 0%, #0078d4 100%);
    }

    .message-icon.claude {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }

    .message-icon.system {
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    }

    .message-icon.error {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    .message-label {
        font-weight: 500;
        font-size: 12px;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .message-content {
        padding-left: 6px;
    }

    /* Paragraph spacing */
    .message-content p {
        margin: 0 0 12px 0;
        line-height: 1.6;
    }

    .message-content p:last-child {
        margin-bottom: 0;
    }

    /* Code blocks generated by markdown parser only */
    .message-content pre.code-block {
        background-color: var(--vscode-textCodeBlock-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        padding: 12px;
        margin: 8px 0;
        overflow-x: auto;
        font-family: var(--vscode-editor-font-family);
        font-size: 13px;
        line-height: 1.5;
        white-space: pre;
    }

    .message-content pre.code-block code {
        background: none;
        border: none;
        padding: 0;
        color: var(--vscode-editor-foreground);
    }

    .code-line {
        white-space: pre-wrap;
        word-break: break-word;
    }

    /* Code block container and header */
    .code-block-container {
        margin: 8px 0;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        background-color: var(--vscode-textCodeBlock-background);
        overflow: hidden;
    }

    .code-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 6px;
        background-color: var(--vscode-editor-background);
        border-bottom: 1px solid var(--vscode-panel-border);
        font-size: 10px;
    }

    .code-block-language {
        color: var(--vscode-descriptionForeground);
        font-family: var(--vscode-editor-font-family);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .code-copy-btn {
        background: none;
        border: none;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        padding: 4px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        opacity: 0.7;
    }

    .code-copy-btn:hover {
        background-color: var(--vscode-list-hoverBackground);
        opacity: 1;
    }

    .code-block-container .code-block {
        margin: 0;
        border: none;
        border-radius: 0;
        background: none;
    }

    /* Inline code */
    .message-content code {
        background-color: var(--vscode-textCodeBlock-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 2px 4px;
        font-family: var(--vscode-editor-font-family);
        font-size: 0.9em;
        color: var(--vscode-editor-foreground);
    }

    /* Links in messages */
    .message-content a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
    }

    .message-content a:hover {
        text-decoration: underline;
        color: var(--vscode-textLink-activeForeground);
    }

    /* Markdown tables */
    .markdown-table-container {
        overflow-x: auto;
        margin: 12px 0;
    }

    .markdown-table {
        border-collapse: collapse;
        width: 100%;
        font-size: 12px;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
    }

    .markdown-table th,
    .markdown-table td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid var(--vscode-panel-border);
    }

    .markdown-table th {
        background-color: rgba(255, 255, 255, 0.05);
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .markdown-table tr:last-child td {
        border-bottom: none;
    }

    .markdown-table tr:hover td {
        background-color: rgba(255, 255, 255, 0.03);
    }

    .markdown-table a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
    }

    .markdown-table a:hover {
        text-decoration: underline;
    }

    .priority-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: 6px;
    }

    .priority-badge.high {
        background: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }

    .priority-badge.medium {
        background: rgba(243, 156, 18, 0.15);
        color: #f39c12;
        border: 1px solid rgba(243, 156, 18, 0.3);
    }

    .priority-badge.low {
        background: rgba(149, 165, 166, 0.15);
        color: #95a5a6;
        border: 1px solid rgba(149, 165, 166, 0.3);
    }

    .tool-input {
        padding: 6px;
        font-family: var(--vscode-editor-font-family);
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-line;
    }

    .tool-input-label {
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
        font-weight: 500;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .tool-input-content {
        color: var(--vscode-editor-foreground);
        opacity: 0.95;
    }

    /* Diff display styles for Edit tool */
    .diff-container {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        overflow: hidden;
    }

    .diff-header {
        background-color: var(--vscode-panel-background);
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        color: var(--vscode-foreground);
        border-bottom: 1px solid var(--vscode-panel-border);
    }

    .diff-removed,
    .diff-added {
        font-family: var(--vscode-editor-font-family);
        font-size: 12px;
        line-height: 1.4;
    }

    .diff-line {
        padding: 2px 12px;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .diff-line.removed {
        background-color: rgba(244, 67, 54, 0.1);
        border-left: 3px solid rgba(244, 67, 54, 0.6);
        color: var(--vscode-foreground);
    }

    .diff-line.added {
        background-color: rgba(76, 175, 80, 0.1);
        border-left: 3px solid rgba(76, 175, 80, 0.6);
        color: var(--vscode-foreground);
    }

    .diff-line.removed::before {
        content: '';
        color: rgba(244, 67, 54, 0.8);
        font-weight: 600;
        margin-right: 8px;
    }

    .diff-line.added::before {
        content: '';
        color: rgba(76, 175, 80, 0.8);
        font-weight: 600;
        margin-right: 8px;
    }

    .diff-expand-container {
        padding: 8px 12px;
        text-align: center;
        border-top: 1px solid var(--vscode-panel-border);
        background-color: var(--vscode-editor-background);
    }

    .diff-expand-btn {
        background: linear-gradient(135deg, rgba(64, 165, 255, 0.15) 0%, rgba(64, 165, 255, 0.1) 100%);
        border: 1px solid rgba(64, 165, 255, 0.3);
        color: #40a5ff;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .diff-expand-btn:hover {
        background: linear-gradient(135deg, rgba(64, 165, 255, 0.25) 0%, rgba(64, 165, 255, 0.15) 100%);
        border-color: rgba(64, 165, 255, 0.5);
    }

    .diff-expand-btn:active {
        transform: translateY(1px);
    }

    /* MultiEdit specific styles */
    .single-edit {
        margin-bottom: 12px;
    }

    .edit-number {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: var(--vscode-descriptionForeground);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        margin-top: 6px;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .diff-edit-separator {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        margin: 12px 0;
    }

    /* File path display styles */
    .diff-file-path {
        padding: 8px 12px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .diff-file-path:hover {
        background-color: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-focusBorder);
    }

    .diff-file-path:active {
        transform: translateY(1px);
    }

    .file-path-short,
    .file-path-truncated {
        font-family: var(--vscode-editor-font-family);
        color: var(--vscode-foreground);
        font-weight: 500;
    }

    .file-path-truncated {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 2px 4px;
        border-radius: 3px;
    }

    .file-path-truncated .file-icon {
        font-size: 14px;
        opacity: 0.7;
        transition: opacity 0.2s ease;
    }

    .file-path-truncated:hover {
        color: var(--vscode-textLink-foreground);
        background-color: var(--vscode-list-hoverBackground);
    }

    .file-path-truncated:hover .file-icon {
        opacity: 1;
    }

    .file-path-truncated:active {
        transform: translateY(1px);
    }

    .expand-btn {
        background: linear-gradient(135deg, rgba(64, 165, 255, 0.15) 0%, rgba(64, 165, 255, 0.1) 100%);
        border: 1px solid rgba(64, 165, 255, 0.3);
        color: #40a5ff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        margin-left: 6px;
        display: inline-block;
        transition: all 0.2s ease;
    }

    .expand-btn:hover {
        background: linear-gradient(135deg, rgba(64, 165, 255, 0.25) 0%, rgba(64, 165, 255, 0.15) 100%);
        border-color: rgba(64, 165, 255, 0.5);
        transform: translateY(-1px);
    }

    .expanded-content {
        margin-top: 8px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        position: relative;
    }

    .expanded-content::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, #40a5ff 0%, #0078d4 100%);
        border-radius: 0 0 0 6px;
    }

    .expanded-content pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .input-container {
        padding: 10px;
        border-top: 1px solid var(--vscode-panel-border);
        background-color: var(--vscode-panel-background);
        display: flex;
        flex-direction: column;
        position: relative;
    }

    /* Slash Commands Popup */
    .slash-commands-popup {
        position: absolute;
        bottom: 100%;
        left: 8px;
        right: 50px;
        background: #1e1e1e;
        border: 1px solid #3c3c3c;
        border-radius: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        margin-bottom: 4px;
    }

    .slash-popup-header {
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 400;
        color: var(--vscode-descriptionForeground);
        border-bottom: 1px solid #3c3c3c;
    }

    .slash-popup-content {
        padding: 4px;
    }

    .slash-command-item {
        display: flex;
        align-items: center;
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.1s ease;
        gap: 10px;
    }

    .slash-command-item:hover {
        background-color: #2a2d2e;
    }

    .slash-command-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--vscode-descriptionForeground);
        flex-shrink: 0;
    }

    .slash-command-icon svg {
        width: 16px;
        height: 16px;
    }

    .slash-command-item:hover .slash-command-icon {
        color: var(--vscode-foreground);
    }

    .slash-command-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .slash-command-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        line-height: 1.2;
    }

    .slash-command-description {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.3;
        opacity: 0.7;
    }

    /* Image Preview Container */
    .image-preview-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px;
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        max-height: 150px;
        overflow-y: auto;
    }

    .image-preview-item {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--vscode-widget-border);
        background: var(--vscode-editor-background);
    }

    .image-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .image-remove-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .image-preview-item:hover .image-remove-btn {
        opacity: 1;
    }

    .image-remove-btn:hover {
        background: rgba(220, 53, 69, 0.9);
    }

    .input-modes {
        display: flex;
        gap: 16px;
        align-items: center;
        padding-bottom: 5px;
        font-size: 12px;
    }

    .mode-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--vscode-foreground);
        opacity: 0.8;
        transition: opacity 0.2s ease;
    }

    .mode-toggle span {
        cursor: pointer;
        transition: opacity 0.2s ease;
    }

    .mode-toggle span:hover {
        opacity: 1;
    }

    .mode-toggle:hover {
        opacity: 1;
    }

    .mode-switch {
        position: relative;
        width: 26px;
        height: 14px;
        background-color: var(--vscode-panel-border);
        border-radius: 7px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .mode-switch.active {
        background-color: var(--vscode-button-background);
    }

    .mode-switch::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 10px;
        height: 10px;
        background-color: var(--vscode-foreground);
        border-radius: 50%;
        transition: transform 0.2s ease;
    }

    .mode-switch.active::after {
        transform: translateX(10px);
        background-color: var(--vscode-button-foreground);
    }

    .textarea-container {
        display: flex;
        gap: 10px;
        align-items: flex-end;
    }

    .textarea-wrapper {
        flex: 1;
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s ease;
    }

    .textarea-wrapper:focus-within {
        border-color: rgba(255, 255, 255, 0.15);
        background-color: rgba(255, 255, 255, 0.04);
    }

    .input-field {
        width: 100%;
        background-color: transparent;
        color: var(--vscode-input-foreground);
        border: none;
        padding: 14px 16px;
        outline: none;
        font-family: var(--vscode-font-family);
        font-size: 13px;
        min-height: 20px;
        line-height: 1.5;
        overflow-y: hidden;
        resize: none;
    }

    .input-field:focus {
        border: none;
        outline: none;
    }

    .input-field::placeholder {
        color: var(--vscode-input-placeholderForeground);
        opacity: 0.5;
        border: none;
        outline: none;
    }

    .input-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background-color: transparent;
    }

    .left-controls {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .model-selector {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
        font-weight: 400;
        transition: all 0.15s ease;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='%23888' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 2.5l3 3 3-3'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 4px center;
        padding-right: 16px;
        min-width: 100px;
    }

    .model-selector:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--vscode-foreground);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .model-selector:focus {
        outline: none;
        border-color: var(--vscode-focusBorder);
    }

    .model-selector option {
        background-color: var(--vscode-dropdown-background);
        color: var(--vscode-dropdown-foreground);
    }

    .tools-btn {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 400;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .tools-btn:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--vscode-foreground);
    }

    .slash-btn,
    .at-btn {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.15s ease;
    }

    .slash-btn:hover,
    .at-btn:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--vscode-foreground);
    }

    .image-btn {
        background-color: transparent;
        color: var(--vscode-descriptionForeground);
        border: none;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        transition: all 0.15s ease;
        transition: all 0.2s ease;
        padding-top: 6px;
    }

    .image-btn:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--vscode-foreground);
    }

    .send-btn {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--vscode-foreground);
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.15s ease;
    }

    .send-btn div {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }

    .send-btn span {
        line-height: 1;
    }

    .send-btn:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .send-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .secondary-button {
        background-color: var(--vscode-button-secondaryBackground, rgba(128, 128, 128, 0.2));
        color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
        border: 1px solid var(--vscode-panel-border);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .secondary-button:hover {
        background-color: var(--vscode-button-secondaryHoverBackground, rgba(128, 128, 128, 0.3));
        border-color: var(--vscode-focusBorder);
    }

    .right-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .yolo-warning {
        font-size: 12px;
        color: var(--vscode-foreground);
        text-align: center;
        font-weight: 500;
        background-color: rgba(255, 99, 71, 0.08);
        border: 1px solid rgba(255, 99, 71, 0.2);
        padding: 8px 12px;
        margin: 4px 4px;
        border-radius: 4px;
        animation: slideDown 0.3s ease;
    }

    /* New Auto-Approve Warning Banner */
    .yolo-warning-new {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin: 8px;
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
        border: 1px solid rgba(255, 152, 0, 0.3);
        border-left: 4px solid #ff9800;
        border-radius: 8px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    }

    .yolo-warning-new.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .yolo-warning-icon {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        border-radius: 8px;
        color: white;
    }

    .yolo-warning-content {
        flex: 1;
        min-width: 0;
    }

    .yolo-warning-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 2px;
    }

    .yolo-warning-description {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
    }

    .yolo-warning-dismiss {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--vscode-descriptionForeground);
        transition: all 0.2s ease;
    }

    .yolo-warning-dismiss:hover {
        background: rgba(0, 0, 0, 0.1);
        color: var(--vscode-foreground);
    }

    /* New Permission Request Card */
    .permission-request-new {
        margin: 12px 0;
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .permission-card-new {
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-panel-border);
        border-left: 4px solid #3b82f6;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .permission-card-new.permission-resolved {
        border-left-color: #10b981;
    }

    .permission-card-new.permission-resolved.denied {
        border-left-color: #ef4444;
    }

    .permission-header-new {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        background: var(--vscode-editor-background);
        border-bottom: 1px solid var(--vscode-panel-border);
    }

    .permission-title-section {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .permission-icon-new {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border-radius: 6px;
        color: white;
    }

    .permission-title-new {
        font-size: 12px;
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .permission-subtitle-new {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        margin-top: 2px;
    }

    .permission-menu-new {
        position: relative;
    }

    .permission-menu-btn-new {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        color: var(--vscode-descriptionForeground);
        transition: all 0.2s ease;
    }

    .permission-menu-btn-new:hover {
        background: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-panel-border);
    }

    .permission-menu-dropdown-new {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        min-width: 240px;
        background: var(--vscode-dropdown-background);
        border: 1px solid var(--vscode-dropdown-border);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: dropdownSlide 0.2s ease;
    }

    @keyframes dropdownSlide {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .permission-menu-item-new {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s ease;
    }

    .permission-menu-item-new:hover {
        background: var(--vscode-list-hoverBackground);
    }

    .permission-menu-item-new svg {
        flex-shrink: 0;
        color: #ff9800;
    }

    .menu-item-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .menu-item-subtitle {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        margin-top: 2px;
    }

    .permission-body-new {
        padding: 16px;
    }

    .permission-question {
        font-size: 12px;
        color: var(--vscode-foreground);
        line-height: 1.5;
        margin-bottom: 16px;
    }

    .tool-name-highlight {
        color: #3b82f6;
        font-weight: 600;
    }

    .permission-actions-new {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .permission-btn-new {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        font-size: 11px;
        font-weight: 500;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
    }

    .permission-btn-new:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .permission-btn-new.deny-btn {
        flex: 0 0 auto;
    }

    .permission-btn-new.deny-btn:hover {
        background: var(--vscode-inputValidation-errorBackground);
        border-color: var(--vscode-errorForeground);
        color: var(--vscode-errorForeground);
    }

    .permission-btn-new.allow-btn {
        flex: 0 0 auto;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border-color: var(--vscode-button-background);
    }

    .permission-btn-new.allow-btn:hover {
        background: var(--vscode-button-hoverBackground);
        border-color: var(--vscode-button-hoverBackground);
    }

    .permission-btn-new.always-allow-btn {
        flex: 1 1 auto;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border-color: #10b981;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px 14px;
    }

    .permission-btn-new.always-allow-btn:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        border-color: #059669;
    }

    .btn-text-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
    }

    .btn-main-text {
        font-size: 11px;
        font-weight: 600;
    }

    .btn-main-text code {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 10px;
    }

    .btn-sub-text {
        font-size: 9px;
        opacity: 0.9;
        font-weight: 400;
    }

    .permission-decision-new {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--vscode-textBlockQuote-background);
        border: 1px solid var(--vscode-textBlockQuote-border);
        border-radius: 6px;
        margin-top: 12px;
        animation: fadeIn 0.3s ease;
    }

    .permission-decision-new.approved {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
    }

    .permission-decision-new.denied {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
    }

    .decision-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .permission-decision-new.approved .decision-icon {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }

    .permission-decision-new.denied .decision-icon {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
    }

    .decision-content {
        flex: 1;
    }

    .decision-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 2px;
    }

    .decision-description {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
    }

    .yolo-suggestion {
        margin-top: 12px;
        padding: 12px;
        background-color: rgba(0, 122, 204, 0.1);
        border: 1px solid rgba(0, 122, 204, 0.3);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .yolo-suggestion-text {
        font-size: 12px;
        color: var(--vscode-foreground);
        flex-grow: 1;
    }

    .yolo-suggestion-btn {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 11px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-weight: 500;
        flex-shrink: 0;
    }

    .yolo-suggestion-btn:hover {
        background-color: var(--vscode-button-hoverBackground);
    }

    .file-picker-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .file-picker-content {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        width: 400px;
        max-height: 500px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .file-picker-header {
        padding: 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .file-picker-header span {
        font-weight: 500;
        color: var(--vscode-foreground);
    }

    .file-search-input {
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        padding: 6px 8px;
        border-radius: 3px;
        outline: none;
        font-size: 13px;
    }

    .file-search-input:focus {
        border-color: var(--vscode-focusBorder);
    }

    .file-list {
        max-height: 400px;
        overflow-y: auto;
        padding: 4px;
    }

    .file-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 3px;
        font-size: 13px;
        gap: 8px;
    }

    .file-item:hover {
        background-color: var(--vscode-list-hoverBackground);
    }

    .file-item.selected {
        background-color: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
    }

    .file-icon {
        font-size: 16px;
        flex-shrink: 0;
    }

    .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .file-name {
        font-weight: 500;
    }

    .file-path {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
    }

    .file-thumbnail {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .thumbnail-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
    }

    .tools-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tools-modal-content {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        width: 700px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }

    .tools-modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--vscode-panel-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
    }

    .tools-modal-body {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .tools-modal-header span {
        font-weight: 600;
        font-size: 14px;
        color: var(--vscode-foreground);
    }

    .tools-close-btn {
        background: none;
        border: none;
        color: var(--vscode-foreground);
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
    }

    .tools-beta-warning {
        padding: 12px 16px;
        background-color: var(--vscode-notifications-warningBackground);
        color: var(--vscode-notifications-warningForeground);
        font-size: 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
    }

    .tools-list {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
    }

    /* MCP Modal content area improvements */
    #mcpModal * {
        box-sizing: border-box;
    }

    #mcpModal .tools-list {
        padding: 24px;
        max-height: calc(80vh - 120px);
        overflow-y: auto;
        width: 100%;
    }

    #mcpModal .mcp-servers-list {
        padding: 0;
    }

    #mcpModal .mcp-add-server {
        padding: 0;
    }

    #mcpModal .mcp-add-form {
        padding: 12px;
    }

    .tool-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 0;
        cursor: pointer;
        border-radius: 6px;
        transition: background-color 0.2s ease;
    }

    .tool-item:last-child {
        border-bottom: none;
    }

    .tool-item:hover {
        background-color: var(--vscode-list-hoverBackground);
        padding: 16px 12px;
        margin: 0 -12px;
    }

    .tool-item input[type="checkbox"], 
    .tool-item input[type="radio"] {
        margin: 0;
        margin-top: 2px;
        flex-shrink: 0;
    }

    .tool-item label {
        color: var(--vscode-foreground);
        font-size: 13px;
        cursor: pointer;
        flex: 1;
        line-height: 1.4;
    }

    .tool-item input[type="checkbox"]:disabled + label {
        opacity: 0.7;
    }

    /* Model selection specific styles */
    .model-explanatory-text {
        padding: 20px;
        padding-bottom: 0px;
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
    }

    .model-title {
        font-weight: 600;
        margin-bottom: 4px;
    }

    .model-description {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.3;
    }

    .model-option-content {
        flex: 1;
    }

    .default-model-layout {
        cursor: pointer;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
    }

    .configure-button {
        margin-left: 12px;
        flex-shrink: 0;
        align-self: flex-start;
    }

    /* Thinking intensity slider */
    .thinking-slider-container {
        position: relative;
        padding: 0px 16px;
        margin: 12px 0;
    }

    .thinking-slider {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--vscode-panel-border);
        outline: none !important;
        border: none;
        cursor: pointer;
        border-radius: 2px;
    }

    .thinking-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: var(--vscode-foreground);
        cursor: pointer;
        border-radius: 50%;
        transition: transform 0.2s ease;
    }

    .thinking-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .thinking-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: var(--vscode-foreground);
        cursor: pointer;
        border-radius: 50%;
        border: none;
        transition: transform 0.2s ease;
    }

    .thinking-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        padding: 0 8px;
    }

    .slider-label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.7;
        transition: all 0.2s ease;
        text-align: center;
        width: 100px;
        cursor: pointer;
    }

    .slider-label:hover {
        opacity: 1;
        color: var(--vscode-foreground);
    }

    .slider-label.active {
        opacity: 1;
        color: var(--vscode-foreground);
        font-weight: 500;
    }

    .slider-label:first-child {
        margin-left: -50px;
    }

    .slider-label:last-child {
        margin-right: -50px;
    }

    .settings-group {
        padding-bottom: 20px;
        margin-bottom: 40px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .settings-group h3 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
    }


    /* Thinking intensity modal */
    .thinking-modal-description {
        padding: 0px 20px;
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.5;
        text-align: center;
        margin: 20px;
        margin-bottom: 0px;
    }

    .thinking-modal-actions {
        padding-top: 20px;
        text-align: right;
        border-top: 1px solid var(--vscode-widget-border);
    }

    .confirm-btn {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: 1px solid var(--vscode-panel-border);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 400;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }

    .confirm-btn:hover {
        background-color: var(--vscode-button-background);
        border-color: var(--vscode-focusBorder);
    }

    /* Slash commands modal */
    .slash-commands-search {
        padding: 16px 20px;
        border-bottom: 1px solid var(--vscode-panel-border);
        position: sticky;
        top: 0;
        background-color: var(--vscode-editor-background);
        z-index: 10;
    }

    .search-input-wrapper {
        display: flex;
        align-items: center;
        border: 1px solid var(--vscode-input-border);
        border-radius: 6px;
        background-color: var(--vscode-input-background);
        transition: all 0.2s ease;
        position: relative;
    }

    .search-input-wrapper:focus-within {
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 0 0 1px var(--vscode-focusBorder);
    }

    .search-prefix {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        background-color: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        font-size: 13px;
        font-weight: 600;
        border-radius: 4px 0 0 4px;
        border-right: 1px solid var(--vscode-input-border);
    }

    .slash-commands-search input {
        flex: 1;
        padding: 8px 12px;
        border: none !important;
        background: transparent;
        color: var(--vscode-input-foreground);
        font-size: 13px;
        outline: none !important;
        box-shadow: none !important;
    }

    .slash-commands-search input:focus {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .slash-commands-search input::placeholder {
        color: var(--vscode-input-placeholderForeground);
    }

    .command-input-wrapper {
        display: flex;
        align-items: center;
        border: 1px solid var(--vscode-input-border);
        border-radius: 6px;
        background-color: var(--vscode-input-background);
        transition: all 0.2s ease;
        width: 100%;
        position: relative;
    }

    .command-input-wrapper:focus-within {
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 0 0 1px var(--vscode-focusBorder);
    }

    .command-prefix {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        background-color: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        font-size: 12px;
        font-weight: 600;
        border-radius: 4px 0 0 4px;
        border-right: 1px solid var(--vscode-input-border);
    }

    .slash-commands-section {
        margin-bottom: 32px;
    }

    .slash-commands-section:last-child {
        margin-bottom: 16px;
    }

    .slash-commands-section h3 {
        margin: 16px 20px 12px 20px;
        font-size: 14px;
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .slash-commands-info {
        padding: 12px 20px;
        background-color: rgba(255, 149, 0, 0.1);
        border: 1px solid rgba(255, 149, 0, 0.2);
        border-radius: 4px;
        margin: 0 20px 16px 20px;
    }

    .slash-commands-info p {
        margin: 0;
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        text-align: center;
        opacity: 0.9;
    }

    .prompt-snippet-item {
        border-left: 2px solid var(--vscode-charts-blue);
        background-color: rgba(0, 122, 204, 0.03);
    }

    .prompt-snippet-item:hover {
        background-color: rgba(0, 122, 204, 0.08);
    }

    .add-snippet-item {
        border-left: 2px solid var(--vscode-charts-green);
        background-color: rgba(0, 200, 83, 0.03);
        border-style: dashed;
    }

    .add-snippet-item:hover {
        background-color: rgba(0, 200, 83, 0.08);
        border-style: solid;
    }

    .add-snippet-form {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        padding: 16px;
        margin: 8px 0;
        animation: slideDown 0.2s ease;
    }

    .add-snippet-form .form-group {
        margin-bottom: 12px;
    }

    .add-snippet-form label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        font-size: 12px;
        color: var(--vscode-foreground);
    }

    .add-snippet-form textarea {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--vscode-input-border);
        border-radius: 3px;
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        font-size: 12px;
        font-family: var(--vscode-font-family);
        box-sizing: border-box;
    }

    .add-snippet-form .command-input-wrapper input {
        flex: 1;
        padding: 6px 8px;
        border: none !important;
        background: transparent;
        color: var(--vscode-input-foreground);
        font-size: 12px;
        font-family: var(--vscode-font-family);
        outline: none !important;
        box-shadow: none !important;
    }

    .add-snippet-form .command-input-wrapper input:focus {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .add-snippet-form textarea:focus {
        outline: none;
        border-color: var(--vscode-focusBorder);
    }

    .add-snippet-form input::placeholder,
    .add-snippet-form textarea::placeholder {
        color: var(--vscode-input-placeholderForeground);
    }

    .add-snippet-form textarea {
        resize: vertical;
        min-height: 60px;
    }

    .add-snippet-form .form-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 12px;
    }

    .custom-snippet-item {
        position: relative;
    }

    .snippet-actions {
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-left: 8px;
    }

    .custom-snippet-item:hover .snippet-actions {
        opacity: 1;
    }

    .snippet-delete-btn {
        background: none;
        border: none;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        padding: 4px;
        border-radius: 3px;
        font-size: 12px;
        transition: all 0.2s ease;
        opacity: 0.7;
    }

    .snippet-delete-btn:hover {
        background-color: rgba(231, 76, 60, 0.1);
        color: var(--vscode-errorForeground);
        opacity: 1;
    }

    .slash-commands-list {
        display: grid;
        gap: 6px;
        padding: 0 20px;
    }

    .slash-command-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        background-color: transparent;
    }

    .slash-command-item:hover {
        background-color: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-list-hoverBackground);
    }

    .slash-command-icon {
        font-size: 16px;
        min-width: 20px;
        text-align: center;
        opacity: 0.8;
    }

    .slash-command-content {
        flex: 1;
    }

    .slash-command-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-foreground);
        margin-bottom: 2px;
    }

    .slash-command-description {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.7;
        line-height: 1.3;
    }

    /* Quick command input */
    .custom-command-item {
        cursor: default;
    }

    .custom-command-item .command-input-wrapper {
        margin-top: 4px;
        max-width: 200px;
    }

    .custom-command-item .command-input-wrapper input {
        flex: 1;
        padding: 4px 6px;
        border: none !important;
        background: transparent;
        color: var(--vscode-input-foreground);
        font-size: 11px;
        font-family: var(--vscode-editor-font-family);
        outline: none !important;
        box-shadow: none !important;
    }

    .custom-command-item .command-input-wrapper input:focus {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .custom-command-item .command-input-wrapper input::placeholder {
        color: var(--vscode-input-placeholderForeground);
        opacity: 0.7;
    }

    .status {
        padding: 6px 16px;
        background: transparent;
        color: var(--vscode-descriptionForeground);
        font-size: 11px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 400;
    }

    .status-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
        transition: all 0.3s ease;
    }

    .status.ready .status-indicator {
        background-color: rgba(34, 197, 94, 0.8);
        box-shadow: 0 0 4px rgba(34, 197, 94, 0.3);
    }

    .status.processing .status-indicator {
        background-color: rgba(251, 191, 36, 0.8);
        box-shadow: 0 0 4px rgba(251, 191, 36, 0.3);
        animation: statusPulse 1.2s ease-in-out infinite;
    }

    .status.error .status-indicator {
        background-color: rgba(239, 68, 68, 0.8);
        box-shadow: 0 0 4px rgba(239, 68, 68, 0.3);
    }

    .status.disconnected .status-indicator {
        background-color: rgba(156, 163, 175, 0.5);
    }

    @keyframes statusPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }

    .status-text {
        flex: 1;
        opacity: 0.8;
    }

    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
    }

    .session-badge {
        margin-left: 16px;
        background-color: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background-color 0.2s, transform 0.1s;
    }

    .session-badge:hover {
        background-color: var(--vscode-button-hoverBackground);
        transform: scale(1.02);
    }

    .session-icon {
        font-size: 10px;
    }

    .session-label {
        opacity: 0.8;
        font-size: 10px;
    }

    .session-status {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        padding: 2px 6px;
        border-radius: 4px;
        background-color: var(--vscode-badge-background);
        border: 1px solid var(--vscode-panel-border);
    }

    .session-status.active {
        color: var(--vscode-terminal-ansiGreen);
        background-color: rgba(0, 210, 106, 0.1);
        border-color: var(--vscode-terminal-ansiGreen);
    }

    /* Markdown content styles */
    .message h1, .message h2, .message h3, .message h4 {
        margin: 0.8em 0 0.4em 0;
        font-weight: 600;
        line-height: 1.3;
    }

    .message h1 {
        font-size: 1.5em;
        border-bottom: 2px solid var(--vscode-panel-border);
        padding-bottom: 0.3em;
    }

    .message h2 {
        font-size: 1.3em;
        border-bottom: 1px solid var(--vscode-panel-border);
        padding-bottom: 0.2em;
    }

    .message h3 {
        font-size: 1.1em;
    }

    .message h4 {
        font-size: 1.05em;
    }

    .message strong {
        font-weight: 600;
        color: var(--vscode-terminal-ansiBrightWhite);
    }

    .message em {
        font-style: italic;
    }

    .message ul, .message ol {
        margin: 0.6em 0;
        padding-left: 1.5em;
    }

    .message li {
        margin: 0.3em 0;
        line-height: 1.4;
    }

    .message ul li {
        list-style-type: disc;
    }

    .message ol li {
        list-style-type: decimal;
    }

    .message p {
        margin: 0.5em 0;
        line-height: 1.6;
    }

    .message p:first-child {
        margin-top: 0;
    }

    .message p:last-child {
        margin-bottom: 0;
    }

    .message br {
        line-height: 1.2;
    }

    .restore-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px
    }

    .restore-btn {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
    }

    .restore-btn.dark {
        background-color: #2d2d30;
        color: #999999;
    }

    .restore-btn:hover {
        background-color: var(--vscode-button-hoverBackground);
    }

    .restore-btn.dark:hover {
        background-color: #3e3e42;
    }

    .restore-date {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.8;
    }

    .conversation-history {
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 60px;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-widget-border);
        z-index: 1000;
    }

    .conversation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--vscode-widget-border);
    }

    .conversation-header h3 {
        margin: 0;
        font-size: 16px;
    }

    .conversation-list {
        padding: 8px;
        overflow-y: auto;
        height: calc(100% - 60px);
    }

    .conversation-item {
        padding: 12px;
        margin: 4px 0;
        border: 1px solid var(--vscode-widget-border);
        border-radius: 6px;
        cursor: pointer;
        background-color: var(--vscode-list-inactiveSelectionBackground);
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
    }

    .conversation-item:hover {
        background-color: var(--vscode-list-hoverBackground);
    }

    .conversation-item:hover .conversation-delete-btn {
        opacity: 1;
    }

    .conversation-content {
        cursor: pointer;
    }

    .conversation-delete-btn {
        opacity: 0;
        background: none;
        border: none;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        flex-shrink: 0;
    }

    .conversation-delete-btn:hover {
        background-color: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
    }

    .conversation-title {
        font-weight: 500;
        margin-bottom: 4px;
    }

    .conversation-meta {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        margin-bottom: 4px;
    }

    .conversation-preview {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.8;
    }

    /* Help content styling */
    .message.help-content {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 10px;
        padding: 20px;
        max-height: 70vh;
        overflow-y: auto;
    }

    .message.help-content .help-message {
        font-size: 13px;
        line-height: 1.6;
    }

    .message.help-content h1 {
        font-size: 20px;
        margin: 0 0 16px 0;
        color: var(--vscode-foreground);
        font-weight: 600;
        padding-bottom: 8px;
        border-bottom: 2px solid rgba(99, 102, 241, 0.3);
    }

    .message.help-content h2 {
        font-size: 16px;
        margin: 20px 0 10px 0;
        color: var(--vscode-foreground);
        font-weight: 600;
        border-bottom: 1px solid var(--vscode-widget-border);
        padding-bottom: 6px;
    }

    .message.help-content h3 {
        font-size: 14px;
        margin: 16px 0 8px 0;
        color: var(--vscode-foreground);
        font-weight: 500;
    }

    .message.help-content ul,
    .message.help-content ol {
        margin: 10px 0;
        padding-left: 24px;
    }

    .message.help-content li {
        margin: 6px 0;
        font-size: 13px;
        line-height: 1.5;
    }

    .message.help-content p {
        margin: 10px 0;
        font-size: 13px;
        line-height: 1.6;
    }

    .message.help-content strong {
        color: var(--vscode-foreground);
        font-weight: 600;
    }

    .message.help-content code {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--vscode-editor-font-family);
        font-size: 12px;
    }

    .message.help-content blockquote,
    .message.help-content .blockquote {
        border-left: 3px solid rgba(99, 102, 241, 0.5);
        margin: 12px 0;
        padding: 8px 16px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 0 6px 6px 0;
        font-style: italic;
    }

    .message.help-content hr {
        border: none;
        border-top: 1px solid var(--vscode-widget-border);
        margin: 16px 0;
    }

    .message.help-content a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
    }

    .message.help-content a:hover {
        text-decoration: underline;
    }

    .message.help-content .code-block-container {
        margin: 12px 0;
        border-radius: 6px;
        overflow: hidden;
    }

    .message.help-content .markdown-table-container {
        margin: 12px 0;
        overflow-x: auto;
    }

    .message.help-content .markdown-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
    }

    .message.help-content .markdown-table th,
    .message.help-content .markdown-table td {
        padding: 8px 12px;
        border: 1px solid var(--vscode-widget-border);
        text-align: left;
    }

    .message.help-content .markdown-table th {
        background-color: rgba(0, 0, 0, 0.15);
        font-weight: 600;
    }

    .message.help-content .markdown-table tr:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.05);
    }

    /* Markdown body styling (for marked.js output) */
    .markdown-body {
        font-family: var(--vscode-font-family);
        font-size: 13px;
        line-height: 1.6;
        color: var(--vscode-foreground);
    }

    .markdown-body h1 {
        font-size: 1.8em;
        font-weight: 600;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--vscode-textBlockQuote-border);
    }

    .markdown-body h2 {
        font-size: 1.4em;
        font-weight: 600;
        margin: 24px 0 12px 0;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--vscode-widget-border);
    }

    .markdown-body h3 {
        font-size: 1.2em;
        font-weight: 600;
        margin: 20px 0 10px 0;
    }

    .markdown-body h4 {
        font-size: 1.1em;
        font-weight: 600;
        margin: 16px 0 8px 0;
    }

    .markdown-body p {
        margin: 12px 0;
    }

    .markdown-body ul,
    .markdown-body ol {
        margin: 12px 0;
        padding-left: 28px;
    }

    .markdown-body li {
        margin: 6px 0;
    }

    .markdown-body li > ul,
    .markdown-body li > ol {
        margin: 4px 0;
    }

    .markdown-body code {
        background-color: var(--vscode-textCodeBlock-background);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--vscode-editor-font-family);
        font-size: 0.9em;
    }

    .markdown-body pre {
        background-color: var(--vscode-textCodeBlock-background);
        padding: 12px 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 12px 0;
    }

    .markdown-body pre code {
        background: none;
        padding: 0;
        font-size: 12px;
        line-height: 1.5;
    }

    .markdown-body blockquote {
        border-left: 4px solid var(--vscode-textBlockQuote-border);
        margin: 12px 0;
        padding: 8px 16px;
        background-color: var(--vscode-textBlockQuote-background);
        border-radius: 0 6px 6px 0;
    }

    .markdown-body blockquote p {
        margin: 4px 0;
    }

    .markdown-body hr {
        border: none;
        border-top: 1px solid var(--vscode-widget-border);
        margin: 20px 0;
    }

    .markdown-body a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
    }

    .markdown-body a:hover {
        text-decoration: underline;
    }

    .markdown-body img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        margin: 8px 0;
    }

    /* Badge images styling - VS Code style badges */
    .markdown-body img[alt*="badge"],
    .markdown-body img[src*="shields.io"],
    .markdown-body img[src*="img.shields.io"],
    .markdown-body img[src*="badge"] {
        display: inline-block;
        height: 20px;
        margin: 4px 4px 4px 0;
        vertical-align: middle;
        border-radius: 3px;
        border: none;
        box-shadow: none;
    }

    /* Special handling for VS Code Extension badge */
    .markdown-body img[alt*="VS Code"],
    .markdown-body img[alt*="Extension"] {
        height: 28px;
        margin: 6px 6px 6px 0;
    }

    .markdown-body table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 12px;
    }

    .markdown-body th,
    .markdown-body td {
        padding: 10px 14px;
        border: 1px solid var(--vscode-widget-border);
        text-align: left;
    }

    .markdown-body th {
        background-color: var(--vscode-textCodeBlock-background);
        font-weight: 600;
    }

    .markdown-body tr:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .markdown-body strong {
        font-weight: 600;
        color: var(--vscode-foreground);
    }

    .markdown-body em {
        font-style: italic;
    }

    /* Horizontal rules in markdown */
    .markdown-body hr {
        border: none;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--vscode-widget-border), transparent);
        margin: 32px 0;
    }

    /* Tool loading animation */
    .tool-loading {
        padding: 16px 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        background-color: var(--vscode-panel-background);
        border-top: 1px solid var(--vscode-panel-border);
    }

    .loading-spinner {
        display: flex;
        gap: 3px;
        align-items: center;
    }

    .loading-ball {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--vscode-descriptionForeground);
        animation: typingPulse 1.4s ease-in-out infinite both;
    }

    .loading-ball:nth-child(1) { animation-delay: -0.32s; }
    .loading-ball:nth-child(2) { animation-delay: -0.16s; }
    .loading-ball:nth-child(3) { animation-delay: 0s; }

    @keyframes typingPulse {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
        }
        40% {
            transform: scale(1);
            opacity: 0.8;
        }
    }

    .loading-text {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        font-style: normal;
        opacity: 0.7;
    }

    /* Typing indicator for Claude responses */
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        color: var(--vscode-descriptionForeground);
        font-size: 12px;
        animation: fadeInUp 0.2s ease-out;
    }

    .typing-dots {
        display: flex;
        gap: 3px;
    }

    .typing-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--vscode-descriptionForeground);
        animation: typingBounce 1s ease-in-out infinite;
    }

    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .typing-dot:nth-child(3) { animation-delay: 0.3s; }

    @keyframes typingBounce {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
        }
        30% {
            transform: translateY(-3px);
            opacity: 1;
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Tool completion indicator */
    .tool-completion {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: rgba(76, 175, 80, 0.1);
        border-top: 1px solid rgba(76, 175, 80, 0.2);
        font-size: 12px;
    }

    .completion-icon {
        color: #4caf50;
        font-weight: bold;
    }

    .completion-text {
        color: var(--vscode-foreground);
        opacity: 0.8;
    }

    /* MCP Servers styles */
    .mcp-servers-list {
        padding: 4px;
    }

    .mcp-server-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        margin-bottom: 16px;
        background-color: var(--vscode-editor-background);
        transition: all 0.2s ease;
    }

    .mcp-server-item:hover {
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .server-info {
        flex: 1;
    }

    .server-name {
        font-weight: 600;
        font-size: 16px;
        color: var(--vscode-foreground);
        margin-bottom: 8px;
    }

    .server-type {
        display: inline-block;
        background-color: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        margin-bottom: 8px;
    }

    .server-config {
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.9;
        line-height: 1.4;
    }

    .server-delete-btn {
        padding: 8px 16px;
        font-size: 13px;
        color: var(--vscode-errorForeground);
        border-color: var(--vscode-errorForeground);
        min-width: 80px;
        justify-content: center;
    }

    .server-delete-btn:hover {
        background-color: var(--vscode-inputValidation-errorBackground);
        border-color: var(--vscode-errorForeground);
    }

    .server-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
    }

    /* MCP Toggle Switch Styles */
    .mcp-toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
    }

    .mcp-toggle-input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .mcp-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--vscode-input-background);
        border: 1px solid var(--vscode-widget-border);
        border-radius: 20px;
        transition: 0.3s;
    }

    .mcp-toggle-slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background-color: var(--vscode-foreground);
        border-radius: 50%;
        transition: 0.3s;
    }

    .mcp-toggle-input:checked + .mcp-toggle-slider {
        background-color: var(--vscode-button-background);
        border-color: var(--vscode-button-background);
    }

    .mcp-toggle-input:checked + .mcp-toggle-slider:before {
        transform: translateX(20px);
        background-color: var(--vscode-button-foreground);
    }

    .mcp-toggle-slider:hover {
        border-color: var(--vscode-focusBorder);
    }

    .server-edit-btn {
        padding: 8px 16px;
        font-size: 13px;
        color: var(--vscode-foreground);
        border-color: var(--vscode-panel-border);
        min-width: 80px;
        transition: all 0.2s ease;
        justify-content: center;
    }

    .server-edit-btn:hover {
        background-color: var(--vscode-list-hoverBackground);
        border-color: var(--vscode-focusBorder);
    }

    .mcp-add-server {
        text-align: center;
        margin-bottom: 24px;
        padding: 0 4px;
    }

    .mcp-add-form {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px;
        padding: 24px;
        margin-top: 20px;
        box-sizing: border-box;
        width: 100%;
    }

    .form-group {
        margin-bottom: 20px;
        box-sizing: border-box;
        width: 100%;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 13px;
        color: var(--vscode-foreground);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        font-size: 13px;
        font-family: var(--vscode-font-family);
        box-sizing: border-box;
        resize: vertical;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 0 0 1px var(--vscode-focusBorder);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 60px;
    }

    .form-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .no-servers {
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-style: italic;
        padding: 40px 20px;
    }

    /* Popular MCP Servers */
    .mcp-popular-servers {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--vscode-panel-border);
    }

    .mcp-popular-servers h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--vscode-foreground);
        opacity: 0.9;
    }

    .popular-servers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
    }

    .popular-server-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .popular-server-item:hover {
        border-color: var(--vscode-focusBorder);
        background-color: var(--vscode-list-hoverBackground);
        transform: translateY(-1px);
    }

    .popular-server-icon {
        font-size: 24px;
        flex-shrink: 0;
    }

    .popular-server-info {
        flex: 1;
        min-width: 0;
    }

    .popular-server-name {
        font-weight: 600;
        font-size: 13px;
        color: var(--vscode-foreground);
        margin-bottom: 2px;
    }

    .popular-server-desc {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Settings Modal specific styles */
    #settingsModal .tools-modal-content {
        width: 500px;
        min-height: 420px;
        max-height: 80vh;
    }

    #settingsModal .tools-list {
        min-height: 280px;
        max-height: 280px;
        overflow-y: auto;
        background: transparent;
    }

    /* Settings Tabs */
    .settings-tabs {
        display: flex;
        border-bottom: 1px solid var(--vscode-panel-border);
        padding: 0 16px;
        background: transparent;
        flex-shrink: 0;
    }

    .settings-tab {
        background: transparent;
        border: none;
        padding: 10px 16px;
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        transition: all 0.2s ease;
    }

    .settings-tab:hover {
        color: var(--vscode-foreground);
        background: var(--vscode-list-hoverBackground);
    }

    .settings-tab.active {
        color: var(--vscode-foreground);
        border-bottom-color: var(--vscode-focusBorder);
        font-weight: 500;
    }

    .settings-tab-content {
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .settings-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 8px;
    }

    .settings-save-status {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        transition: all 0.2s ease;
    }

    .settings-save-status.success {
        color: #4ade80;
    }

    .settings-save-status.error {
        color: #ef4444;
    }

    .settings-select {
        width: 100%;
        padding: 8px 10px;
        font-size: 12px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        cursor: pointer;
    }

    .settings-select:focus {
        outline: none;
        border-color: var(--vscode-focusBorder);
    }

    .provider-config-section {
        margin-top: 16px;
        padding: 0;
        background: transparent;
        border-radius: 0;
        border: none;
    }

    .test-result {
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .test-result.success {
        background: var(--vscode-testing-iconPassed);
        color: #fff;
    }

    .test-result.error {
        background: var(--vscode-testing-iconFailed);
        color: #fff;
    }

    .test-result.loading {
        color: var(--vscode-descriptionForeground);
    }

    /* MCP Server Type Tabs */
    .mcp-type-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    .mcp-type-tab {
        flex: 1;
        padding: 10px 16px;
        font-size: 12px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        color: var(--vscode-descriptionForeground);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
    }

    .mcp-type-tab:hover {
        background: var(--vscode-list-hoverBackground);
        color: var(--vscode-foreground);
    }

    .mcp-type-tab.active {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border-color: var(--vscode-button-background);
    }

    .mcp-form-section {
        display: none;
    }

    .mcp-form-section.active {
        display: block;
    }

    /* Animated Loading Indicator */
    .animated-loading {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        color: var(--vscode-descriptionForeground);
        font-size: 13px;
        animation: fadeIn 0.3s ease;
    }

    .loading-dots {
        display: flex;
        gap: 4px;
    }

    .loading-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--vscode-textLink-foreground);
        opacity: 0.4;
        animation: loadingDot 1.4s ease-in-out infinite;
    }

    .loading-dots span:nth-child(1) {
        animation-delay: 0s;
    }

    .loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes loadingDot {
        0%, 80%, 100% {
            opacity: 0.4;
            transform: scale(1);
        }
        40% {
            opacity: 1;
            transform: scale(1.2);
        }
    }

    .loading-text {
        color: var(--vscode-descriptionForeground);
        font-style: italic;
        animation: textFade 2s ease-in-out;
    }

    @keyframes textFade {
        0% {
            opacity: 0;
            transform: translateY(4px);
        }
        20% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* VS Code Native Markdown Preview Styles */
    .markdown-preview-content {
        padding: 0;
        margin: 0;
        background: transparent;
    }

    .vscode-markdown-body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, Ubuntu, 'Droid Sans', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: var(--vscode-foreground);
        word-wrap: break-word;
    }

    .vscode-markdown-body h1 {
        font-size: 2em;
        font-weight: 600;
        padding-bottom: 0.3em;
        border-bottom: 1px solid var(--vscode-panel-border);
        margin: 0 0 16px 0;
    }

    .vscode-markdown-body h2 {
        font-size: 1.5em;
        font-weight: 600;
        padding-bottom: 0.3em;
        border-bottom: 1px solid var(--vscode-panel-border);
        margin: 24px 0 16px 0;
    }

    .vscode-markdown-body h3 {
        font-size: 1.25em;
        font-weight: 600;
        margin: 24px 0 16px 0;
    }

    .vscode-markdown-body h4 {
        font-size: 1em;
        font-weight: 600;
        margin: 24px 0 16px 0;
    }

    .vscode-markdown-body h5 {
        font-size: 0.875em;
        font-weight: 600;
        margin: 24px 0 16px 0;
    }

    .vscode-markdown-body h6 {
        font-size: 0.85em;
        font-weight: 600;
        margin: 24px 0 16px 0;
        color: var(--vscode-descriptionForeground);
    }

    .vscode-markdown-body p {
        margin: 0 0 16px 0;
    }

    .vscode-markdown-body ul,
    .vscode-markdown-body ol {
        margin: 0 0 16px 0;
        padding-left: 2em;
    }

    .vscode-markdown-body li {
        margin: 0.25em 0;
    }

    .vscode-markdown-body li > p {
        margin: 0;
    }

    .vscode-markdown-body li > ul,
    .vscode-markdown-body li > ol {
        margin: 0;
    }

    .vscode-markdown-body code {
        font-family: var(--vscode-editor-font-family, 'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', 'Liberation Mono', 'DejaVu Sans Mono', 'Courier New', monospace);
        font-size: 0.9em;
        padding: 0.2em 0.4em;
        background-color: var(--vscode-textCodeBlock-background);
        border-radius: 3px;
    }

    .vscode-markdown-body pre {
        margin: 0 0 16px 0;
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--vscode-textCodeBlock-background);
        border-radius: 6px;
    }

    .vscode-markdown-body pre code {
        padding: 0;
        background: transparent;
        font-size: inherit;
        border-radius: 0;
    }

    .vscode-markdown-body blockquote {
        margin: 0 0 16px 0;
        padding: 0 1em;
        color: var(--vscode-descriptionForeground);
        border-left: 0.25em solid var(--vscode-textBlockQuote-border);
    }

    .vscode-markdown-body blockquote > :first-child {
        margin-top: 0;
    }

    .vscode-markdown-body blockquote > :last-child {
        margin-bottom: 0;
    }

    .vscode-markdown-body hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: var(--vscode-panel-border);
        border: 0;
    }

    .vscode-markdown-body a {
        color: var(--vscode-textLink-foreground);
        text-decoration: none;
    }

    .vscode-markdown-body a:hover {
        text-decoration: underline;
    }

    .vscode-markdown-body img {
        max-width: 100%;
        height: auto;
        box-sizing: content-box;
    }

    .vscode-markdown-body table {
        display: block;
        width: max-content;
        max-width: 100%;
        overflow: auto;
        margin: 0 0 16px 0;
        border-spacing: 0;
        border-collapse: collapse;
    }

    .vscode-markdown-body th {
        font-weight: 600;
        padding: 6px 13px;
        border: 1px solid var(--vscode-panel-border);
    }

    .vscode-markdown-body td {
        padding: 6px 13px;
        border: 1px solid var(--vscode-panel-border);
    }

    .vscode-markdown-body tr {
        background-color: transparent;
        border-top: 1px solid var(--vscode-panel-border);
    }

    .vscode-markdown-body tr:nth-child(2n) {
        background-color: var(--vscode-textCodeBlock-background);
    }

    .vscode-markdown-body strong {
        font-weight: 600;
    }

    .vscode-markdown-body em {
        font-style: italic;
    }

    .vscode-markdown-body del {
        text-decoration: line-through;
    }

    /* Badge styling for shields.io badges */
    .vscode-markdown-body img[alt*="badge"],
    .vscode-markdown-body img[src*="shields.io"],
    .vscode-markdown-body img[src*="img.shields.io"],
    .vscode-markdown-body img[src*="badge"] {
        display: inline-block;
        vertical-align: middle;
        margin: 0 2px;
    }

    /* Task list styling */
    .vscode-markdown-body input[type="checkbox"] {
        margin: 0 0.35em 0.25em -1.6em;
        vertical-align: middle;
    }

    .vscode-markdown-body .contains-task-list {
        list-style: none;
        padding-left: 1.6em;
    }
</style>`

export default styles