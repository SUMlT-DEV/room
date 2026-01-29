/* --- CONFIGURATION --- */
const CONFIG = {
    members: [
        { name: "PREM MANDAL", startOffset: 0 },
        { name: "KESHAV KUMAR", startOffset: 1 },
        { name: "SUMIT KUMAR", startOffset: 2 },
        { name: "SANJIT KUMAR", startOffset: 3 },
        { name: "UTTAM MANDAL", startOffset: 4 }
    ],
    basinPattern: [
        "KESHAV KUMAR", "UTTAM MANDAL", "SANJIT KUMAR", "SUMIT KUMAR", "PREM MANDAL"
    ],
    works: ["पोछा लगाना", "झाड़ू लगाना", "सब्जी लाना", "पानी लाना", "कचरा फेंकना"],
    translations: {
        "पोछा लगाना": "Mopping",
        "झाड़ू लगाना": "Sweeping",
        "सब्जी लाना": "Vegetables",
        "पानी लाना": "Water",
        "कचरा फेंकना": "Garbage"
    },
    styles: {
        "पोछा लगाना": { 
            gradient: "from-blue-500/20 to-blue-600/5", 
            text: "text-blue-300", 
            border: "border-blue-500/30",
            icon: "droplets"
        },
        "झाड़ू लगाना": { 
            gradient: "from-orange-500/20 to-orange-600/5", 
            text: "text-orange-300", 
            border: "border-orange-500/30",
            icon: "brush"
        },
        "सब्जी लाना": { 
            gradient: "from-emerald-500/20 to-emerald-600/5", 
            text: "text-emerald-300", 
            border: "border-emerald-500/30",
            icon: "carrot"
        },
        "पानी लाना": { 
            gradient: "from-cyan-500/20 to-cyan-600/5", 
            text: "text-cyan-300", 
            border: "border-cyan-500/30",
            icon: "waves"
        },
        "कचरा फेंकना": { 
            gradient: "from-rose-500/20 to-rose-600/5", 
            text: "text-rose-300", 
            border: "border-rose-500/30",
            icon: "trash-2"
        }
    }
};

/* --- LOGIC CORE --- */
class App {
    constructor() {
        this.state = {
            date: new Date(),
            viewIndex: 0,
            year: new Date().getFullYear(),
            month: new Date().getMonth()
        };
        this.state.date.setHours(0, 0, 0, 0);
        
        this.init();
    }

    init() {
        // Initial calculation for current week
        this.state.viewIndex = this.getCurrentWeekIndex();
        
        // Bind UI
        this.ui = {
            month: document.getElementById('monthSelect'),
            year: document.getElementById('currentYear'),
            weekInfo: document.getElementById('weekInfo'),
            weekDates: document.getElementById('weekDates'),
            prevBtn: document.getElementById('prevWeekBtn'),
            nextBtn: document.getElementById('nextWeekBtn'),
            teamList: document.getElementById('teamList'),
            basinChart: document.getElementById('basinChart'),
            modal: document.getElementById('profileModal'),
            modalContent: document.getElementById('modalContent'),
            exportBtn: document.getElementById('generatePdfBtn')
        };

        // Event Listeners
        this.ui.month.addEventListener('change', (e) => {
            this.state.month = parseInt(e.target.value);
            this.state.viewIndex = 0;
            this.render();
            this.toast('Month updated', 'info');
        });

        this.ui.exportBtn.addEventListener('click', () => this.generatePDF());
        
        this.render();
    }

    /* --- HELPERS --- */
    getWeeksInMonth(year, month) {
        const weeks = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let start = new Date(firstDay);
        start.setDate(start.getDate() - start.getDay()); // Get Sunday
        
        let current = new Date(start);
        let num = 1;
        
        while (current <= lastDay || num === 1) {
            const wStart = new Date(current);
            const wEnd = new Date(current);
            wEnd.setDate(wEnd.getDate() + 6);
            
            if (wStart.getMonth() > month && num > 1 && wStart.getFullYear() >= year) break;
            
            weeks.push({
                id: num,
                start: new Date(wStart),
                end: new Date(wEnd),
                label: this.formatDateRange(wStart, wEnd)
            });
            
            current.setDate(current.getDate() + 7);
            num++;
        }
        return weeks;
    }

    formatDateRange(start, end) {
        const opts = { month: 'short', day: 'numeric' };
        if (start.getMonth() === end.getMonth()) {
            return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.getDate()}`;
        }
        return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
    }

    getCurrentWeekIndex() {
        const weeks = this.getWeeksInMonth(this.state.year, this.state.month);
        const now = this.state.date.getTime();
        const idx = weeks.findIndex(w => now >= w.start.getTime() && now <= w.end.getTime());
        return idx === -1 ? 0 : idx;
    }

    getAbsoluteWeekDiff(weekIdx) {
        // Reference: Nov 9, 2025 (Week 2 of Nov roughly)
        const ref = new Date(2025, 10, 9);
        const weeks = this.getWeeksInMonth(this.state.year, this.state.month);
        const target = weeks[weekIdx]?.start;
        if (!target) return 0;
        
        const diffTime = target.getTime() - ref.getTime();
        return Math.floor(Math.floor(diffTime / (1000 * 60 * 60 * 24)) / 7);
    }

    getWork(memberIdx, weekIdx) {
        const absWeek = this.getAbsoluteWeekDiff(weekIdx);
        const workIdx = ((CONFIG.members[memberIdx].startOffset + absWeek) % CONFIG.works.length + CONFIG.works.length) % CONFIG.works.length;
        return CONFIG.works[workIdx];
    }

    /* --- ACTIONS --- */
    changeYear(dir) {
        this.state.year += dir;
        this.state.viewIndex = 0;
        this.render();
    }

    changeWeek(dir) {
        const weeks = this.getWeeksInMonth(this.state.year, this.state.month);
        const next = this.state.viewIndex + dir;
        if (next >= 0 && next < weeks.length) {
            this.state.viewIndex = next;
            this.render();
        }
    }

    /* --- RENDER --- */
    render() {
        // Sync Controls
        this.ui.year.textContent = this.state.year;
        this.ui.month.value = this.state.month;

        const weeks = this.getWeeksInMonth(this.state.year, this.state.month);
        const currentWeek = weeks[this.state.viewIndex];

        // View Navigation State
        this.ui.prevBtn.disabled = this.state.viewIndex === 0;
        this.ui.nextBtn.disabled = this.state.viewIndex >= weeks.length - 1;

        // Header Info
        const isNow = this.state.date.getTime() >= currentWeek.start.getTime() && this.state.date.getTime() <= currentWeek.end.getTime();
        this.ui.weekInfo.innerHTML = `
            Week ${currentWeek.id} 
            ${isNow ? '<span class="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 align-middle">NOW</span>' : ''}
        `;
        this.ui.weekDates.textContent = currentWeek.label;

        // Render Components
        this.renderTeamList(currentWeek);
        this.renderBasinChart();
        
        // Re-init icons
        if(window.lucide) lucide.createIcons();
    }

    renderTeamList() {
        this.ui.teamList.innerHTML = '';
        
        CONFIG.members.forEach((member, idx) => {
            const work = this.getWork(idx, this.state.viewIndex);
            const style = CONFIG.styles[work];

            const card = document.createElement('div');
            card.className = `glass-panel p-5 rounded-2xl border-l-4 ${style.border.replace('border', 'border-l')} hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden`;
            card.onclick = () => this.openProfile(idx);

            card.innerHTML = `
                <div class="flex items-start justify-between relative z-10">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-display font-bold text-lg text-white shadow-lg group-hover:scale-105 transition-transform">
                            ${member.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-200 group-hover:text-white transition-colors">${member.name}</h3>
                            <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Team Member</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span class="text-xs text-gray-400 font-medium">Assigned Duty</span>
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${style.gradient} border ${style.border}">
                        <i data-lucide="${style.icon}" class="w-3.5 h-3.5 ${style.text}"></i>
                        <span class="text-xs font-bold ${style.text}">${work}</span>
                    </div>
                </div>
                
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-r ${style.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition duration-500"></div>
            `;
            this.ui.teamList.appendChild(card);
        });
    }

    renderBasinChart() {
        this.ui.basinChart.innerHTML = '';
        
        CONFIG.basinPattern.forEach((name, idx) => {
            const isLast = idx === CONFIG.basinPattern.length - 1;
            
            // Node
            const node = document.createElement('div');
            node.className = 'flex flex-col items-center relative group';
            node.innerHTML = `
                <div class="w-14 h-14 rounded-full bg-[#0a0a0a] border-2 border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all z-10">
                    <span class="font-display font-bold text-white">${name.charAt(0)}</span>
                </div>
                <div class="mt-3 text-center">
                    <div class="text-xs font-bold text-gray-300 whitespace-nowrap">${name.split(' ')[0]}</div>
                </div>
            `;
            this.ui.basinChart.appendChild(node);

            // Connector
            if (!isLast) {
                const connector = document.createElement('div');
                connector.className = 'w-16 h-[2px] bg-blue-900/50 relative self-start mt-7 mx-2';
                connector.innerHTML = `<div class="absolute inset-0 bg-blue-500/50 w-1/2 animate-pulse"></div>`;
                this.ui.basinChart.appendChild(connector);
            }
        });
    }

    /* --- MODAL --- */
    openProfile(idx) {
        const member = CONFIG.members[idx];
        const currentWork = this.getWork(idx, this.state.viewIndex);
        const style = CONFIG.styles[currentWork];

        document.getElementById('profileName').textContent = member.name;
        document.getElementById('profileInitial').textContent = member.name.charAt(0);
        
        // Chip
        const chip = document.getElementById('categoryChip');
        chip.innerHTML = `
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${style.gradient} border ${style.border} shadow-lg">
                <i data-lucide="${style.icon}" class="w-5 h-5 ${style.text}"></i>
                <span class="font-bold ${style.text}">${currentWork}</span>
            </div>
        `;

        // List
        const list = document.getElementById('scheduleList');
        list.innerHTML = '';
        const weeks = this.getWeeksInMonth(this.state.year, this.state.month);
        
        weeks.forEach((w, wIdx) => {
            const work = this.getWork(idx, wIdx);
            const wStyle = CONFIG.styles[work];
            const isCurrent = wIdx === this.state.viewIndex;
            
            const row = document.createElement('div');
            row.className = `flex justify-between items-center p-3 rounded-lg ${isCurrent ? 'bg-white/10 border border-purple-500/50' : 'bg-white/5 border border-white/5'}`;
            row.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-xs ${isCurrent ? 'text-purple-300 font-bold' : 'text-gray-400'}">Week ${w.id}</span>
                    <span class="text-[10px] text-gray-500">${w.label}</span>
                </div>
                <span class="text-xs font-medium ${wStyle.text}">${work}</span>
            `;
            list.appendChild(row);
        });

        // Animation Classes
        this.ui.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Trigger entry animation
        setTimeout(() => {
            this.ui.modalContent.classList.remove('opacity-0', 'scale-95', 'translate-y-10');
            this.ui.modalContent.classList.add('opacity-100', 'scale-100', 'translate-y-0');
        }, 10);
        
        if(window.lucide) lucide.createIcons();
    }

    closeProfile() {
        // Trigger exit animation
        this.ui.modalContent.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
        this.ui.modalContent.classList.add('opacity-0', 'scale-95', 'translate-y-10');
        
        setTimeout(() => {
            this.ui.modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    /* --- PDF EXPORT --- */
    async generatePDF() {
        const btn = this.ui.exportBtn;
        const origHtml = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Generating...`;
        btn.disabled = true;
        if(window.lucide) lucide.createIcons();

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const monthName = this.ui.month.options[this.state.month].text;

            // Header
            doc.setFillColor(24, 24, 27); // Dark header
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setFontSize(22);
            doc.setTextColor(139, 92, 246); // Purple
            doc.setFont("helvetica", "bold");
            doc.text('Work Manage', 14, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(160, 160, 160);
            doc.setFont("helvetica", "normal");
            doc.text('Duty Roster Report', 14, 30);

            doc.text(`${monthName} ${this.state.year}`, pageWidth - 14, 25, { align: 'right' });

            // Table
            const weeks = this.getWeeksInMonth(this.state.year, this.state.month);
            const headers = [['Member', ...weeks.map(w => `W${w.id} (${w.start.getDate()}-${w.end.getDate()})`)]];
            
            const data = CONFIG.members.map((m, mIdx) => {
                return [
                    m.name, 
                    ...weeks.map((w, wIdx) => {
                        const hindi = this.getWork(mIdx, wIdx);
                        return CONFIG.translations[hindi] || hindi;
                    })
                ];
            });

            doc.autoTable({
                startY: 50,
                head: headers,
                body: data,
                theme: 'grid',
                styles: { 
                    fontSize: 10, 
                    cellPadding: 6,
                    lineColor: [230, 230, 230]
                },
                headStyles: { 
                    fillColor: [139, 92, 246], 
                    textColor: 255, 
                    fontStyle: 'bold' 
                },
                columnStyles: {
                    0: { fontStyle: 'bold', fillColor: [245, 245, 255] }
                },
                alternateRowStyles: {
                    fillColor: [250, 250, 250]
                }
            });

            // Footer
            const pages = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Generated via Work Manage | ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.getHeight() - 10);
            }

            doc.save(`Roster_${monthName}_${this.state.year}.pdf`);
            this.toast('Report downloaded successfully', 'success');

        } catch (err) {
            console.error(err);
            this.toast('Failed to generate PDF', 'error');
        } finally {
            btn.innerHTML = origHtml;
            btn.disabled = false;
            if(window.lucide) lucide.createIcons();
        }
    }

    /* --- UTILS --- */
    toast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        const el = document.createElement('div');
        
        const colors = {
            success: 'border-green-500/50 bg-green-900/80 text-white',
            error: 'border-red-500/50 bg-red-900/80 text-white',
            info: 'border-blue-500/50 bg-blue-900/80 text-white'
        };
        
        el.className = `${colors[type]} backdrop-blur-md border px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up pointer-events-auto min-w-[250px]`;
        
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-octagon' : 'info';
        
        el.innerHTML = `
            <i data-lucide="${icon}" class="w-5 h-5"></i>
            <span class="font-medium text-sm">${msg}</span>
        `;
        
        container.appendChild(el);
        if(window.lucide) lucide.createIcons();
        
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }
}

// Initialize
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
