// Enhanced RecruitPro Helper Functions with Kanban Pipeline Support

// Utility functions for date and time
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatTimestamp(timestamp);
};

// Theme management
const themeManager = {
    themes: ['light', 'dark'],
    currentTheme: 'light',
    
    init() {
        const savedTheme = localStorage.getItem('recruitpro_theme') || 'light';
        this.setTheme(savedTheme);
    },
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // CRITICAL: Actually switch the CSS file
        const themeStylesheet = document.getElementById('theme-stylesheet');
        if (themeStylesheet) {
            themeStylesheet.href = `css/themes/${theme}.css`;
            console.log(`🎨 Theme switched to ${theme}.css`);
        }
        
        localStorage.setItem('recruitpro_theme', theme);
    },
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },
    
    getCurrent() {
        return this.currentTheme;
    }
};

// Local storage helper
const storage = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save failed:', error);
            return false;
        }
    },
    
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load failed:', error);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove failed:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear failed:', error);
            return false;
        }
    }
};

// Form validation helpers
const validators = {
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    phone(phone) {
        const regex = /^[\+]?[1-9][\d]{0,15}$/;
        return regex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
    
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
};

// Search and filter helpers
const searchHelpers = {
    normalizeText(text) {
        return text.toString().toLowerCase().trim();
    },
    
    searchInText(searchTerm, targetText) {
        if (!searchTerm || !targetText) return false;
        return this.normalizeText(targetText).includes(this.normalizeText(searchTerm));
    },
    
    searchInArray(searchTerm, array) {
        if (!searchTerm || !Array.isArray(array)) return false;
        return array.some(item => this.searchInText(searchTerm, item));
    },
    
    multiFieldSearch(searchTerm, object, fields) {
        if (!searchTerm) return true;
        return fields.some(field => {
            const value = object[field];
            if (Array.isArray(value)) {
                return this.searchInArray(searchTerm, value);
            }
            return this.searchInText(searchTerm, value || '');
        });
    }
};

// UPDATED: Status and readiness mappings with Kanban Pipeline Support
const statusConfig = {
    // Updated statuses to match the requested kanban pipeline: Applied → Screening → Interview → Hold → Offer → Hired
    statuses: [
        { value: 'exploratory', label: 'Exploratory', color: '#06b6d4', emoji: '🔎', description: 'Headhunted, exploring interest' },
        { value: 'applied', label: 'Applied', color: '#4299e1', emoji: '📋', description: 'New applications' },
        { value: 'screening', label: 'Screening', color: '#ed8936', emoji: '🔍', description: 'Initial review' },
        { value: 'interview', label: 'Interview', color: '#9f7aea', emoji: '💬', description: 'Interview process' },
        { value: 'hold', label: 'Hold', color: '#718096', emoji: '⏸️', description: 'On hold' },
        { value: 'offer', label: 'Offer', color: '#48bb78', emoji: '💰', description: 'Offer extended' },
        { value: 'hired', label: 'Hired', color: '#38b2ac', emoji: '🎉', description: 'Successfully hired' },
        { value: 'rejected', label: 'Rejected', color: '#e53e3e', emoji: '❌', description: 'Not selected for role' }
    ],
    
    readiness: [
        { value: 'ready', label: 'Ready', emoji: '✅', color: '#48bb78' },
        { value: 'almost_ready', label: 'Almost Ready', emoji: '⚠️', color: '#ed8936' },
        { value: 'not_ready', label: 'Not Ready', emoji: '❌', color: '#fc8181' }
    ],
    
    getStatusLabel(value) {
        const status = this.statuses.find(s => s.value === value);
        return status ? status.label : value;
    },
    
    getReadinessConfig(value) {
        return this.readiness.find(r => r.value === value) || this.readiness[2];
    },

    // NEW: Get status config by value
    getStatusConfig(value) {
        return this.statuses.find(s => s.value === value) || this.statuses[0];
    },

    // NEW: Get kanban stages for the candidate pipeline
    getKanbanStages() {
        return [
            { 
                id: 'exploratory', 
                title: 'Exploratory', 
                status: 'exploratory', 
                color: '#06b6d4',
                emoji: '🔎',
                description: 'Headhunted, exploring interest'
            },
            { 
                id: 'applied', 
                title: 'Applied', 
                status: 'applied', 
                color: '#4299e1',
                emoji: '📋',
                description: 'New applications'
            },
            { 
                id: 'screening', 
                title: 'Screening', 
                status: 'screening', 
                color: '#ed8936',
                emoji: '🔍',
                description: 'Initial review'
            },
            { 
                id: 'interview', 
                title: 'Interview', 
                status: 'interview', 
                color: '#9f7aea',
                emoji: '💬',
                description: 'Interview process'
            },
            { 
                id: 'hold', 
                title: 'Hold', 
                status: 'hold', 
                color: '#718096',
                emoji: '⏸️',
                description: 'On hold'
            },
            { 
                id: 'offer', 
                title: 'Offer', 
                status: 'offer', 
                color: '#48bb78',
                emoji: '💰',
                description: 'Offer extended'
            },
            { 
                id: 'hired', 
                title: 'Hired', 
                status: 'hired', 
                color: '#38b2ac',
                emoji: '🎉',
                description: 'Successfully hired'
            },
            { 
                id: 'rejected', 
                title: 'Rejected', 
                status: 'rejected', 
                color: '#e53e3e',
                emoji: '❌',
                description: 'Not selected for role'
            }
        ];
    }
    
};

// Predefined options
const predefinedOptions = {
    tags: [
        'Senior', 'Junior', 'Remote', 'On-site', 'Urgent', 'High Priority',
        'Technical', 'Management', 'Contractor', 'Full-time', 'Part-time',
        'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'DevOps',
        'Leadership', 'Team Lead', 'Architect', 'Consultant'
    ],
    
    sources: [
        'LinkedIn', 'Indeed', 'Referral', 'Company Website', 
        'Recruiter', 'Job Fair', 'University', 'Other'
    ],
    
    genders: [
        { value: '', label: 'Prefer not to say' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ],
    
    interviewTypes: [
        'technical', 'behavioral', 'leadership', 'cultural', 'final'
    ],

    // Countries list - alphabetically sorted by country name
    countries: [
        { value: '', label: 'Select Country' },
        { value: 'AF', label: '🇦🇫 Afghanistan' },
        { value: 'AX', label: '🇦🇽 Åland Islands' },
        { value: 'AL', label: '🇦🇱 Albania' },
        { value: 'DZ', label: '🇩🇿 Algeria' },
        { value: 'AS', label: '🇦🇸 American Samoa' },
        { value: 'AD', label: '🇦🇩 Andorra' },
        { value: 'AO', label: '🇦🇴 Angola' },
        { value: 'AI', label: '🇦🇮 Anguilla' },
        { value: 'AQ', label: '🇦🇶 Antarctica' },
        { value: 'AG', label: '🇦🇬 Antigua and Barbuda' },
        { value: 'AR', label: '🇦🇷 Argentina' },
        { value: 'AM', label: '🇦🇲 Armenia' },
        { value: 'AW', label: '🇦🇼 Aruba' },
        { value: 'AU', label: '🇦🇺 Australia' },
        { value: 'AT', label: '🇦🇹 Austria' },
        { value: 'AZ', label: '🇦🇿 Azerbaijan' },
        { value: 'BS', label: '🇧🇸 Bahamas' },
        { value: 'BH', label: '🇧🇭 Bahrain' },
        { value: 'BD', label: '🇧🇩 Bangladesh' },
        { value: 'BB', label: '🇧🇧 Barbados' },
        { value: 'BY', label: '🇧🇾 Belarus' },
        { value: 'BE', label: '🇧🇪 Belgium' },
        { value: 'BZ', label: '🇧🇿 Belize' },
        { value: 'BJ', label: '🇧🇯 Benin' },
        { value: 'BM', label: '🇧🇲 Bermuda' },
        { value: 'BT', label: '🇧🇹 Bhutan' },
        { value: 'BO', label: '🇧🇴 Bolivia' },
        { value: 'BA', label: '🇧🇦 Bosnia and Herzegovina' },
        { value: 'BW', label: '🇧🇼 Botswana' },
        { value: 'BV', label: '🇧🇻 Bouvet Island' },
        { value: 'BR', label: '🇧🇷 Brazil' },
        { value: 'IO', label: '🇮🇴 British Indian Ocean Territory' },
        { value: 'VG', label: '🇻🇬 British Virgin Islands' },
        { value: 'BN', label: '🇧🇳 Brunei' },
        { value: 'BG', label: '🇧🇬 Bulgaria' },
        { value: 'BF', label: '🇧🇫 Burkina Faso' },
        { value: 'BI', label: '🇧🇮 Burundi' },
        { value: 'KH', label: '🇰🇭 Cambodia' },
        { value: 'CM', label: '🇨🇲 Cameroon' },
        { value: 'CA', label: '🇨🇦 Canada' },
        { value: 'CV', label: '🇨🇻 Cape Verde' },
        { value: 'BQ', label: '🇧🇶 Caribbean Netherlands' },
        { value: 'KY', label: '🇰🇾 Cayman Islands' },
        { value: 'CF', label: '🇨🇫 Central African Republic' },
        { value: 'TD', label: '🇹🇩 Chad' },
        { value: 'CL', label: '🇨🇱 Chile' },
        { value: 'CN', label: '🇨🇳 China' },
        { value: 'CX', label: '🇨🇽 Christmas Island' },
        { value: 'CC', label: '🇨🇨 Cocos Islands' },
        { value: 'CO', label: '🇨🇴 Colombia' },
        { value: 'KM', label: '🇰🇲 Comoros' },
        { value: 'CK', label: '🇨🇰 Cook Islands' },
        { value: 'CR', label: '🇨🇷 Costa Rica' },
        { value: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
        { value: 'HR', label: '🇭🇷 Croatia' },
        { value: 'CU', label: '🇨🇺 Cuba' },
        { value: 'CW', label: '🇨🇼 Curaçao' },
        { value: 'CY', label: '🇨🇾 Cyprus' },
        { value: 'CZ', label: '🇨🇿 Czech Republic' },
        { value: 'CD', label: '🇨🇩 Democratic Republic of the Congo' },
        { value: 'DK', label: '🇩🇰 Denmark' },
        { value: 'DJ', label: '🇩🇯 Djibouti' },
        { value: 'DM', label: '🇩🇲 Dominica' },
        { value: 'DO', label: '🇩🇴 Dominican Republic' },
        { value: 'TL', label: '🇹🇱 East Timor' },
        { value: 'EC', label: '🇪🇨 Ecuador' },
        { value: 'EG', label: '🇪🇬 Egypt' },
        { value: 'SV', label: '🇸🇻 El Salvador' },
        { value: 'GQ', label: '🇬🇶 Equatorial Guinea' },
        { value: 'ER', label: '🇪🇷 Eritrea' },
        { value: 'EE', label: '🇪🇪 Estonia' },
        { value: 'SZ', label: '🇸🇿 Eswatini' },
        { value: 'ET', label: '🇪🇹 Ethiopia' },
        { value: 'FK', label: '🇫🇰 Falkland Islands' },
        { value: 'FO', label: '🇫🇴 Faroe Islands' },
        { value: 'FJ', label: '🇫🇯 Fiji' },
        { value: 'FI', label: '🇫🇮 Finland' },
        { value: 'FR', label: '🇫🇷 France' },
        { value: 'GF', label: '🇬🇫 French Guiana' },
        { value: 'PF', label: '🇵🇫 French Polynesia' },
        { value: 'TF', label: '🇹🇫 French Southern Territories' },
        { value: 'GA', label: '🇬🇦 Gabon' },
        { value: 'GM', label: '🇬🇲 Gambia' },
        { value: 'GE', label: '🇬🇪 Georgia' },
        { value: 'DE', label: '🇩🇪 Germany' },
        { value: 'GH', label: '🇬🇭 Ghana' },
        { value: 'GI', label: '🇬🇮 Gibraltar' },
        { value: 'GR', label: '🇬🇷 Greece' },
        { value: 'GL', label: '🇬🇱 Greenland' },
        { value: 'GD', label: '🇬🇩 Grenada' },
        { value: 'GP', label: '🇬🇵 Guadeloupe' },
        { value: 'GU', label: '🇬🇺 Guam' },
        { value: 'GT', label: '🇬🇹 Guatemala' },
        { value: 'GG', label: '🇬🇬 Guernsey' },
        { value: 'GN', label: '🇬🇳 Guinea' },
        { value: 'GW', label: '🇬🇼 Guinea-Bissau' },
        { value: 'GY', label: '🇬🇾 Guyana' },
        { value: 'HT', label: '🇭🇹 Haiti' },
        { value: 'HM', label: '🇭🇲 Heard Island' },
        { value: 'HN', label: '🇭🇳 Honduras' },
        { value: 'HK', label: '🇭🇰 Hong Kong' },
        { value: 'HU', label: '🇭🇺 Hungary' },
        { value: 'IS', label: '🇮🇸 Iceland' },
        { value: 'IN', label: '🇮🇳 India' },
        { value: 'ID', label: '🇮🇩 Indonesia' },
        { value: 'IR', label: '🇮🇷 Iran' },
        { value: 'IQ', label: '🇮🇶 Iraq' },
        { value: 'IE', label: '🇮🇪 Ireland' },
        { value: 'IM', label: '🇮🇲 Isle of Man' },
        { value: 'IL', label: '🇮🇱 Israel' },
        { value: 'IT', label: '🇮🇹 Italy' },
        { value: 'JM', label: '🇯🇲 Jamaica' },
        { value: 'JP', label: '🇯🇵 Japan' },
        { value: 'JE', label: '🇯🇪 Jersey' },
        { value: 'JO', label: '🇯🇴 Jordan' },
        { value: 'KZ', label: '🇰🇿 Kazakhstan' },
        { value: 'KE', label: '🇰🇪 Kenya' },
        { value: 'KI', label: '🇰🇮 Kiribati' },
        { value: 'KW', label: '🇰🇼 Kuwait' },
        { value: 'KG', label: '🇰🇬 Kyrgyzstan' },
        { value: 'LA', label: '🇱🇦 Laos' },
        { value: 'LV', label: '🇱🇻 Latvia' },
        { value: 'LB', label: '🇱🇧 Lebanon' },
        { value: 'LS', label: '🇱🇸 Lesotho' },
        { value: 'LR', label: '🇱🇷 Liberia' },
        { value: 'LY', label: '🇱🇾 Libya' },
        { value: 'LI', label: '🇱🇮 Liechtenstein' },
        { value: 'LT', label: '🇱🇹 Lithuania' },
        { value: 'LU', label: '🇱🇺 Luxembourg' },
        { value: 'MO', label: '🇲🇴 Macao' },
        { value: 'MG', label: '🇲🇬 Madagascar' },
        { value: 'MW', label: '🇲🇼 Malawi' },
        { value: 'MY', label: '🇲🇾 Malaysia' },
        { value: 'MV', label: '🇲🇻 Maldives' },
        { value: 'ML', label: '🇲🇱 Mali' },
        { value: 'MT', label: '🇲🇹 Malta' },
        { value: 'MH', label: '🇲🇭 Marshall Islands' },
        { value: 'MQ', label: '🇲🇶 Martinique' },
        { value: 'MR', label: '🇲🇷 Mauritania' },
        { value: 'MU', label: '🇲🇺 Mauritius' },
        { value: 'YT', label: '🇾🇹 Mayotte' },
        { value: 'MX', label: '🇲🇽 Mexico' },
        { value: 'FM', label: '🇫🇲 Micronesia' },
        { value: 'MD', label: '🇲🇩 Moldova' },
        { value: 'MC', label: '🇲🇨 Monaco' },
        { value: 'MN', label: '🇲🇳 Mongolia' },
        { value: 'ME', label: '🇲🇪 Montenegro' },
        { value: 'MS', label: '🇲🇸 Montserrat' },
        { value: 'MA', label: '🇲🇦 Morocco' },
        { value: 'MZ', label: '🇲🇿 Mozambique' },
        { value: 'MM', label: '🇲🇲 Myanmar' },
        { value: 'NA', label: '🇳🇦 Namibia' },
        { value: 'NR', label: '🇳🇷 Nauru' },
        { value: 'NP', label: '🇳🇵 Nepal' },
        { value: 'NL', label: '🇳🇱 Netherlands' },
        { value: 'NC', label: '🇳🇨 New Caledonia' },
        { value: 'NZ', label: '🇳🇿 New Zealand' },
        { value: 'NI', label: '🇳🇮 Nicaragua' },
        { value: 'NE', label: '🇳🇪 Niger' },
        { value: 'NG', label: '🇳🇬 Nigeria' },
        { value: 'NU', label: '🇳🇺 Niue' },
        { value: 'NF', label: '🇳🇫 Norfolk Island' },
        { value: 'KP', label: '🇰🇵 North Korea' },
        { value: 'MK', label: '🇲🇰 North Macedonia' },
        { value: 'MP', label: '🇲🇵 Northern Mariana Islands' },
        { value: 'NO', label: '🇳🇴 Norway' },
        { value: 'OM', label: '🇴🇲 Oman' },
        { value: 'PK', label: '🇵🇰 Pakistan' },
        { value: 'PW', label: '🇵🇼 Palau' },
        { value: 'PS', label: '🇵🇸 Palestine' },
        { value: 'PA', label: '🇵🇦 Panama' },
        { value: 'PG', label: '🇵🇬 Papua New Guinea' },
        { value: 'PY', label: '🇵🇾 Paraguay' },
        { value: 'PE', label: '🇵🇪 Peru' },
        { value: 'PH', label: '🇵🇭 Philippines' },
        { value: 'PN', label: '🇵🇳 Pitcairn Islands' },
        { value: 'PL', label: '🇵🇱 Poland' },
        { value: 'PT', label: '🇵🇹 Portugal' },
        { value: 'PR', label: '🇵🇷 Puerto Rico' },
        { value: 'QA', label: '🇶🇦 Qatar' },
        { value: 'CG', label: '🇨🇬 Republic of the Congo' },
        { value: 'RE', label: '🇷🇪 Réunion' },
        { value: 'RO', label: '🇷🇴 Romania' },
        { value: 'RU', label: '🇷🇺 Russia' },
        { value: 'RW', label: '🇷🇼 Rwanda' },
        { value: 'BL', label: '🇧🇱 Saint Barthélemy' },
        { value: 'SH', label: '🇸🇭 Saint Helena' },
        { value: 'KN', label: '🇰🇳 Saint Kitts and Nevis' },
        { value: 'LC', label: '🇱🇨 Saint Lucia' },
        { value: 'MF', label: '🇲🇫 Saint Martin' },
        { value: 'PM', label: '🇵🇲 Saint Pierre and Miquelon' },
        { value: 'VC', label: '🇻🇨 Saint Vincent and the Grenadines' },
        { value: 'WS', label: '🇼🇸 Samoa' },
        { value: 'SM', label: '🇸🇲 San Marino' },
        { value: 'ST', label: '🇸🇹 São Tomé and Príncipe' },
        { value: 'SA', label: '🇸🇦 Saudi Arabia' },
        { value: 'SN', label: '🇸🇳 Senegal' },
        { value: 'RS', label: '🇷🇸 Serbia' },
        { value: 'SC', label: '🇸🇨 Seychelles' },
        { value: 'SL', label: '🇸🇱 Sierra Leone' },
        { value: 'SG', label: '🇸🇬 Singapore' },
        { value: 'SX', label: '🇸🇽 Sint Maarten' },
        { value: 'SK', label: '🇸🇰 Slovakia' },
        { value: 'SI', label: '🇸🇮 Slovenia' },
        { value: 'SB', label: '🇸🇧 Solomon Islands' },
        { value: 'SO', label: '🇸🇴 Somalia' },
        { value: 'ZA', label: '🇿🇦 South Africa' },
        { value: 'GS', label: '🇬🇸 South Georgia' },
        { value: 'KR', label: '🇰🇷 South Korea' },
        { value: 'SS', label: '🇸🇸 South Sudan' },
        { value: 'ES', label: '🇪🇸 Spain' },
        { value: 'LK', label: '🇱🇰 Sri Lanka' },
        { value: 'SD', label: '🇸🇩 Sudan' },
        { value: 'SR', label: '🇸🇷 Suriname' },
        { value: 'SJ', label: '🇸🇯 Svalbard and Jan Mayen' },
        { value: 'SE', label: '🇸🇪 Sweden' },
        { value: 'CH', label: '🇨🇭 Switzerland' },
        { value: 'SY', label: '🇸🇾 Syria' },
        { value: 'TW', label: '🇹🇼 Taiwan' },
        { value: 'TJ', label: '🇹🇯 Tajikistan' },
        { value: 'TZ', label: '🇹🇿 Tanzania' },
        { value: 'TH', label: '🇹🇭 Thailand' },
        { value: 'TG', label: '🇹🇬 Togo' },
        { value: 'TK', label: '🇹🇰 Tokelau' },
        { value: 'TO', label: '🇹🇴 Tonga' },
        { value: 'TT', label: '🇹🇹 Trinidad and Tobago' },
        { value: 'TN', label: '🇹🇳 Tunisia' },
        { value: 'TR', label: '🇹🇷 Turkey' },
        { value: 'TM', label: '🇹🇲 Turkmenistan' },
        { value: 'TC', label: '🇹🇨 Turks and Caicos Islands' },
        { value: 'TV', label: '🇹🇻 Tuvalu' },
        { value: 'VI', label: '🇻🇮 U.S. Virgin Islands' },
        { value: 'UM', label: '🇺🇲 U.S. Minor Outlying Islands' },
        { value: 'UG', label: '🇺🇬 Uganda' },
        { value: 'UA', label: '🇺🇦 Ukraine' },
        { value: 'AE', label: '🇦🇪 United Arab Emirates' },
        { value: 'GB', label: '🇬🇧 United Kingdom' },
        { value: 'US', label: '🇺🇸 United States' },
        { value: 'UY', label: '🇺🇾 Uruguay' },
        { value: 'UZ', label: '🇺🇿 Uzbekistan' },
        { value: 'VU', label: '🇻🇺 Vanuatu' },
        { value: 'VA', label: '🇻🇦 Vatican City' },
        { value: 'VE', label: '🇻🇪 Venezuela' },
        { value: 'VN', label: '🇻🇳 Vietnam' },
        { value: 'WF', label: '🇼🇫 Wallis and Futuna' },
        { value: 'EH', label: '🇪🇭 Western Sahara' },
        { value: 'YE', label: '🇾🇪 Yemen' },
        { value: 'ZM', label: '🇿🇲 Zambia' },
        { value: 'ZW', label: '🇿🇼 Zimbabwe' }
    ]
};

// Statistics calculator with dual analytics system
const statsCalculator = {
    // Legacy method for backwards compatibility
    calculate(candidates) {
        const operational = this.calculateOperationalStats(candidates);
        const historical = this.calculateHistoricalStats(candidates);
        
        return {
            // Keep existing format for backwards compatibility
            total: operational.totalActive,
            diversity: this.calculateDiversity(candidates),
            ...this.calculateStatusBreakdown(candidates.filter(c => !c.archived)),
            ...this.calculateReadinessBreakdown(candidates.filter(c => !c.archived)),
            newThisWeek: this.calculateNewThisWeek(candidates),
            
            // Add new dual stats
            operational,
            historical
        };
    },
    
    // OPERATIONAL METRICS - Current pipeline management (active candidates only)
    calculateOperationalStats(candidates) {
        const activeCandidates = candidates.filter(c => !c.archived);
        
        return {
            totalActive: activeCandidates.length,
            totalArchived: candidates.filter(c => c.archived).length,
            inPipeline: activeCandidates.filter(c => 
                ['applied', 'screening', 'interview', 'offer'].includes(c.status)
            ).length,
            currentlyHired: activeCandidates.filter(c => c.status === 'hired').length,
            readyToHire: activeCandidates.filter(c => c.readiness === 'ready').length,
            interviewing: activeCandidates.filter(c => c.status === 'interview').length,
            
            // Status breakdown for active candidates
            statusBreakdown: statusConfig.statuses.reduce((acc, status) => {
                acc[status.value] = activeCandidates.filter(c => c.status === status.value).length;
                return acc;
            }, {}),
            
            // Readiness breakdown for active candidates
            readinessBreakdown: statusConfig.readiness.reduce((acc, readiness) => {
                acc[readiness.value] = activeCandidates.filter(c => c.readiness === readiness.value).length;
                return acc;
            }, {})
        };
    },
    
    // HISTORICAL METRICS - All-time analytics (all candidates regardless of archive status)
    calculateHistoricalStats(candidates) {
        return {
            totalEverProcessed: candidates.length,
            totalEverHired: candidates.filter(c => c.status === 'hired').length,
            overallSuccessRate: this.calculateSuccessRate(candidates),
            archivedCount: candidates.filter(c => c.archived).length,
            
            // Historical status breakdown (all candidates)
            historicalStatusBreakdown: statusConfig.statuses.reduce((acc, status) => {
                acc[status.value] = candidates.filter(c => c.status === status.value).length;
                return acc;
            }, {}),
            
            // Company performance (historical)
            companyStats: this.calculateCompanyStats(candidates),
            
            // Gender diversity (historical)
            diversityStats: this.calculateDiversity(candidates),
            
            // Time-based metrics
            newThisWeek: this.calculateNewThisWeek(candidates),
            newThisMonth: this.calculateNewThisMonth(candidates),
            hiredThisMonth: this.calculateHiredThisMonth(candidates)
        };
    },
    
    // PROJECT ANALYTICS - Dual system for projects
    calculateProjectOperationalStats(projects, candidates) {
        const activeProjects = projects.filter(p => p.status !== 'archived');
        
        return activeProjects.map(project => {
            const projectCandidates = candidates.filter(c => c.project_id === project.id);
            const activeCandidates = projectCandidates.filter(c => !c.archived);
            
            return {
                ...project,
                // Operational metrics (active candidates only)
                activeCandidates: activeCandidates.length,
                inPipeline: activeCandidates.filter(c => c.status !== 'hired').length,
                currentProgress: project.target_hires > 0 ? 
                    Math.round((activeCandidates.filter(c => c.status === 'hired').length / project.target_hires) * 100) : 0
            };
        });
    },
    
    calculateProjectHistoricalStats(projects, candidates) {
        return projects.map(project => {
            const allProjectCandidates = candidates.filter(c => c.project_id === project.id);
            const hiredCount = allProjectCandidates.filter(c => c.status === 'hired').length;
            
            return {
                ...project,
                // Historical metrics (all candidates)
                totalProcessed: allProjectCandidates.length,
                totalHired: hiredCount,
                successRate: this.calculateSuccessRate(allProjectCandidates),
                completionRate: project.target_hires > 0 ? 
                    Math.round((hiredCount / project.target_hires) * 100) : 0,
                isCompleted: project.target_hires > 0 && hiredCount >= project.target_hires
            };
        });
    },
    
    // Utility methods
    calculateSuccessRate(candidates) {
        if (candidates.length === 0) return 0;
        const hired = candidates.filter(c => c.status === 'hired').length;
        return Math.round((hired / candidates.length) * 100);
    },
    
    calculateCompanyStats(candidates) {
        const companyStats = {};
        candidates.forEach(candidate => {
            const company = candidate.company || 'Unknown';
            if (!companyStats[company]) {
                companyStats[company] = {
                    total: 0,
                    hired: 0,
                    successRate: 0
                };
            }
            companyStats[company].total++;
            if (candidate.status === 'hired') {
                companyStats[company].hired++;
            }
        });
        
        // Calculate success rates
        Object.keys(companyStats).forEach(company => {
            const stats = companyStats[company];
            stats.successRate = stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0;
        });
        
        return companyStats;
    },
    
    calculateNewThisMonth(candidates) {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return candidates.filter(c => new Date(c.created_at) > monthAgo).length;
    },
    
    calculateHiredThisMonth(candidates) {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return candidates.filter(c => 
            c.status === 'hired' && 
            c.hired_date && 
            new Date(c.hired_date) > monthAgo
        ).length;
    },
    
    // Original methods (keeping these exactly the same)
    calculateDiversity(candidates) {
        return candidates.reduce((acc, candidate) => {
            const gender = candidate.gender || 'not_specified';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
    },
    
    calculateStatusBreakdown(candidates) {
        return statusConfig.statuses.reduce((acc, status) => {
            acc[status.value] = candidates.filter(c => c.status === status.value).length;
            return acc;
        }, {});
    },
    
    calculateReadinessBreakdown(candidates) {
        return statusConfig.readiness.reduce((acc, readiness) => {
            acc[readiness.value] = candidates.filter(c => c.readiness === readiness.value).length;
            return acc;
        }, {});
    },
    
    calculateNewThisWeek(candidates) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return candidates.filter(c => new Date(c.created_at) > weekAgo).length;
    },

    // Calculate kanban stage statistics
    calculateKanbanStats(candidates) {
        const stages = statusConfig.getKanbanStages();
        const stats = {};
        
        stages.forEach(stage => {
            stats[stage.status] = candidates.filter(c => (c.status || 'applied') === stage.status).length;
        });
        
        return stats;
    }
};

// NEW: Drag and Drop helpers for Kanban functionality
const dragDropHelpers = {
    // Handle drag start
    handleDragStart(e, item, type = 'candidate') {
        const dragData = {
            item: item,
            type: type,
            timestamp: Date.now()
        };
        
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        
        // Visual feedback
        if (e.target) {
            e.target.style.opacity = '0.6';
            e.target.style.transform = 'rotate(5deg)';
        }
    },

    // Handle drag end
    handleDragEnd(e) {
        if (e.target) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
        }
    },

    // Handle drag over
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Visual feedback for drop zone
        if (e.currentTarget) {
            e.currentTarget.style.background = 'rgba(66, 153, 225, 0.1)';
            e.currentTarget.style.borderColor = '#4299e1';
        }
    },

    // Handle drag leave
    handleDragLeave(e) {
        if (e.currentTarget) {
            e.currentTarget.style.background = '';
            e.currentTarget.style.borderColor = '';
        }
    },

    // Handle drop
    handleDrop(e, newStatus, onUpdate) {
        e.preventDefault();
        
        // Reset visual feedback
        if (e.currentTarget) {
            e.currentTarget.style.background = '';
            e.currentTarget.style.borderColor = '';
        }
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            
            if (dragData.type === 'candidate' && dragData.item) {
                const candidate = dragData.item;
                
                if (candidate.status !== newStatus) {
                    if (onUpdate && typeof onUpdate === 'function') {
                        onUpdate(candidate, newStatus);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to handle drop:', error);
        }
    }
};

// NEW: Animation helpers for smooth transitions
const animationHelpers = {
    // Slide in from right animation
    slideInFromRight: `
        @keyframes slideInFromRight {
            from { 
                transform: translateX(100%); 
                opacity: 0;
            }
            to { 
                transform: translateX(0); 
                opacity: 1;
            }
        }
    `,
    
    // Fade in animation
    fadeIn: `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `,
    
    // Scale in animation
    scaleIn: `
        @keyframes scaleIn {
            from { 
                transform: scale(0.8); 
                opacity: 0;
            }
            to { 
                transform: scale(1); 
                opacity: 1;
            }
        }
    `,
    
    // Pulse animation for notifications
    pulse: `
        @keyframes pulse {
            0%, 100% { 
                transform: scale(1);
                opacity: 1;
            }
            50% { 
                transform: scale(1.05);
                opacity: 0.8;
            }
        }
    `,

    // Apply animation to element
    applyAnimation(element, animationName, duration = '0.3s', easing = 'ease') {
        if (element) {
            element.style.animation = `${animationName} ${duration} ${easing}`;
        }
    }
};

// Export to global scope
window.helpers = {
    formatTimestamp,
    formatTimeAgo,
    themeManager,
    storage,
    validators,
    searchHelpers,
    statusConfig,
    predefinedOptions,
    statsCalculator,
    dragDropHelpers,
    animationHelpers
};