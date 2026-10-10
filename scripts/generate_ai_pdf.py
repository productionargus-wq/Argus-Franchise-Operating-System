"""
Script to generate the comprehensive Executive AI Integration Strategy PDF
for the Argus Franchise Operating System.
Features 6-page precision layout with zero awkward splits.
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

# Define Argus Brand Colors
PRIMARY = colors.HexColor("#FF6600")       # Argus Safety Orange
DARK_CHARCOAL = colors.HexColor("#1E252B") # Deep Charcoal / Primary Text
NAVY_HEADER = colors.HexColor("#0F172A")   # Deep Slate Navy
BG_LIGHT = colors.HexColor("#F8FAFC")      # Slate 50
BORDER_COLOR = colors.HexColor("#CBD5E1")  # Slate 300
MUTED_TEXT = colors.HexColor("#64748B")    # Slate 500
ACCENT_BLUE = colors.HexColor("#0284C7")   # Sky 600
SUCCESS_GREEN = colors.HexColor("#059669") # Emerald 600
CARD_BG = colors.HexColor("#FFFFFF")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Clean cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(MUTED_TEXT)

        # Header
        self.drawString(54, 750, "ARGUS FRANCHISE OPERATING SYSTEM (FOS)")
        self.setFont("Helvetica", 8)
        self.drawRightString(612 - 54, 750, "AI INTEGRATION & INTELLIGENCE ARCHITECTURE STRATEGY")
        
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.75)
        self.line(54, 742, 612 - 54, 742)

        # Footer
        self.line(54, 42, 612 - 54, 42)
        self.setFont("Helvetica", 8)
        self.drawString(54, 30, "CONFIDENTIAL  |  ARGUS CNC SYSTEMS  |  EXECUTIVE ROADMAP")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 30, page_str)

        self.restoreState()


def create_ai_strategy_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Typography
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=29,
        textColor=NAVY_HEADER,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=PRIMARY,
        spaceAfter=18
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=NAVY_HEADER,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_CHARCOAL,
        spaceAfter=5
    )

    bullet_title_style = ParagraphStyle(
        'BulletTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=NAVY_HEADER,
        spaceBefore=3,
        spaceAfter=1,
        keepWithNext=True
    )

    bullet_desc_style = ParagraphStyle(
        'BulletDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=DARK_CHARCOAL,
        leftIndent=10,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=DARK_CHARCOAL
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=NAVY_HEADER
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER & EXECUTIVE SUMMARY & ARCHITECTURE VISION
    # =========================================================================
    story.append(Spacer(1, 10))
    tag_style = ParagraphStyle('TagStyle', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=PRIMARY)
    story.append(Paragraph("STRATEGIC TECHNOLOGY REPORT  •  ARGUS CNC ECOSYSTEM", tag_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("AI-Powered Franchise Operating System", title_style))
    story.append(Paragraph("Transforming Argus CNC Partner OS with Domain-Specific Artificial Intelligence & Machine Learning", subtitle_style))
    
    meta_data = [
        [
            Paragraph("<b>Target System:</b> Argus Franchise Operating System (FOS)", body_style),
            Paragraph("<b>Document Version:</b> 1.0 (Comprehensive Release)", body_style)
        ],
        [
            Paragraph("<b>Core Stack:</b> Next.js 14, TypeScript, MongoDB Atlas", body_style),
            Paragraph("<b>Prepared For:</b> Executive Leadership & Engineering Team", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Executive Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=1, spaceAfter=6))
    
    exec_text = (
        "The <b>Argus Franchise Operating System (FOS)</b> currently operates as an enterprise-grade, multi-tenant B2B SaaS platform "
        "managing the sales, fulfillment, field commissioning, and aftermarket services for industrial CNC machinery. "
        "It successfully digitizes lead routing, price policy governance, milestone-based commission settlements, field installations with digital sign-offs, "
        "4-hour critical breakdown SLAs, and warranty renewals.<br/><br/>"
        "By integrating targeted <b>Domain-Specific AI and Multimodal Machine Learning</b>, Argus can transition from a transactional workflow portal "
        "into an <b>Autonomous Industrial Operating Intelligence Platform</b>. This strategic blueprint outlines <b>16 actionable AI capabilities</b> categorized across "
        "5 strategic pillars—ranging from CAD-to-Quotation machine matching and computer-vision pre-installation inspection to acoustic vibration diagnostics "
        "and autonomous WhatsApp renewal negotiation. These initiatives drive customer retention, eliminate manual review bottlenecks, and ensure complete channel governance."
    )
    story.append(Paragraph(exec_text, body_style))
    story.append(Spacer(1, 10))

    # High-level architecture highlight box
    kpi_box_data = [
        [
            Paragraph("<font color='#FF6600'><b>12</b></font><br/><b>Core Modules Audited</b><br/><font color='#64748B'>Leads, Demos, Quotes, Orders, Service, Renewals</font>", body_style),
            Paragraph("<font color='#FF6600'><b>16</b></font><br/><b>AI Opportunities</b><br/><font color='#64748B'>Computer Vision, GenAI RAG, Audio ML, Forecasters</font>", body_style),
            Paragraph("<font color='#FF6600'><b>5</b></font><br/><b>Strategic Pillars</b><br/><font color='#64748B'>Sales, Service, Commissioning, Governance, Aftermarket</font>", body_style),
            Paragraph("<font color='#059669'><b>+35%</b></font><br/><b>Efficiency Target</b><br/><font color='#64748B'>Shorter sales cycle & zero aborted field visits</font>", body_style)
        ]
    ]
    kpi_table = Table(kpi_box_data, colWidths=[126, 126, 126, 126])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 7),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(kpi_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: COMPLETE MODULE INVENTORY TABLE (FITS ENTIRELY ON PAGE 2)
    # =========================================================================
    story.append(Paragraph("1. Codebase Feature Inventory & Architectural Baseline", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=1, spaceAfter=5))
    story.append(Paragraph(
        "A rigorous audit of all deployed routes, schemas, and repository functions in the Argus FOS application:", body_style
    ))

    modules_data = [
        [
            Paragraph("Module & Path", table_header_style),
            Paragraph("Core Functionality Implemented", table_header_style),
            Paragraph("Current Automation & Rule Engines", table_header_style)
        ],
        [
            Paragraph("<b>Multi-Tenant Governance</b><br/><code>/super-admin</code>, <code>/register</code>", table_cell_bold),
            Paragraph("Enterprise onboarding, GSTIN validation, Super Admin vetting, tenant data isolation with compound <code>orgId</code> indexing.", table_cell_style),
            Paragraph("Compound indexing migration, role partitioning (HO Admin, Franchise Admin, Sales, Engineer, Finance).", table_cell_style)
        ],
        [
            Paragraph("<b>Franchise Network & Rerouting</b><br/><code>/ho/franchises</code>", table_cell_bold),
            Paragraph("Franchise onboarding, quota tracking, cascade impact scanner, and automated territory reassignment on termination.", table_cell_style),
            Paragraph("<b>Heuristic Proximity Engine</b>: Scored matching by 3-digit postal PIN prefix (+25), districts (+15), and city.", table_cell_style)
        ],
        [
            Paragraph("<b>Territory & Conflict Detection</b><br/><code>/ho/territory</code>", table_cell_bold),
            Paragraph("Exclusive postal PIN code protection and dynamic territory assignment.", table_cell_style),
            Paragraph("PIN-level conflict detection banner; auto-assigns franchise based on client postal PIN.", table_cell_style)
        ],
        [
            Paragraph("<b>Lead Pipeline & Conversion</b><br/><code>/leads</code>, <code>/ho/leads</code>", table_cell_bold),
            Paragraph("Lead capture across channels (Exhibitions, Web, Calls), follow-up scheduling, and 1-click conversion to Opportunity & Customer.", table_cell_style),
            Paragraph("Auto-routing to franchise PIN owner; auto-provisioning Customer and Opportunity records on conversion.", table_cell_style)
        ],
        [
            Paragraph("<b>Opportunities & Trial Cuts</b><br/><code>/opportunities/[id]</code>", table_cell_bold),
            Paragraph("7-stage pipeline tracking (New to Won) with technical trial-cut logging (spindle parameters, cycle times, sample test results).", table_cell_style),
            Paragraph("Stage timeline management, 1-click quotation pre-fill from trial demo parameters.", table_cell_style)
        ],
        [
            Paragraph("<b>Price Master & Policy Engine</b><br/><code>/quotations/new</code>, <code>/ho/products</code>", table_cell_bold),
            Paragraph("Central price master with MSRP, franchise transfer prices, minimum selling prices, and max allowed discounts.", table_cell_style),
            Paragraph("<b>Price Control Engine</b>: Auto-locks quotes into <code>Pending_Approval</code> if discount > 10% or below min price.", table_cell_style)
        ],
        [
            Paragraph("<b>Sales Orders & Milestones</b><br/><code>/orders/[id]</code>", table_cell_bold),
            Paragraph("PO binding, 5-stage fulfillment tracker (Confirmed ➔ QC ➔ Delivered), milestone payment schedules (20% Advance, 70% Dispatch, 10% Sign-off).", table_cell_style),
            Paragraph("Auto-generates commission records and installation orders upon PO creation; auto-clears order on full receipt.", table_cell_style)
        ],
        [
            Paragraph("<b>Commission Settlement Ledger</b><br/><code>/commissions</code>, <code>/ho/commissions</code>", table_cell_bold),
            Paragraph("Transaction-level franchise commission tracking tied strictly to bank-verified milestone collections.", table_cell_style),
            Paragraph("Proportional commission accrual (8% on received milestone funds); prevents disbursement until verified.", table_cell_style)
        ],
        [
            Paragraph("<b>Field Installation & Sign-Off</b><br/><code>/installations/[id]</code>", table_cell_bold),
            Paragraph("5-step commissioning checklist (Delivery, Pre-install, Leveling, Training, Acceptance) with HTML5 Canvas digital signature pad.", table_cell_style),
            Paragraph("Auto-assigns service engineer; auto-instantiates 365-day warranty renewal and increments customer fleet count.", table_cell_style)
        ],
        [
            Paragraph("<b>Support Tickets & Critical SLA</b><br/><code>/support/[id]</code>", table_cell_bold),
            Paragraph("Breakdown incident tracking with technician comment threads and resolution sign-offs.", table_cell_style),
            Paragraph("Automatic SLA countdown timers (Critical = 4 hours, High = 8 hours); breach monitoring alerts.", table_cell_style)
        ],
        [
            Paragraph("<b>Warranty & AMC Renewals</b><br/><code>/renewals</code>", table_cell_bold),
            Paragraph("Recurring revenue engine monitoring warranty/AMC expiration at 60d, 30d, 15d, 7d countdown milestones.", table_cell_style),
            Paragraph("Automated countdown tracking, reminder dispatch logging (WhatsApp/Email/In-App).", table_cell_style)
        ],
        [
            Paragraph("<b>Customer 360° Profile & Fleet</b><br/><code>/customers/[id]</code>", table_cell_bold),
            Paragraph("Unified operational dashboard with live aggregated Lifetime Value, active machine fleet, open tickets, and upsell matrix.", table_cell_style),
            Paragraph("Dynamic aggregation from Orders, Installations, Tickets, Renewals; fleet-based heuristic upsell rules.", table_cell_style)
        ]
    ]

    mod_table = Table(modules_data, colWidths=[120, 204, 180])
    mod_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT])
    ]))
    story.append(mod_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: PILLAR I & PILLAR II
    # =========================================================================
    story.append(Paragraph("2. Strategic AI Integration: 5 Core Value Pillars", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=1, spaceAfter=6))
    
    # PILLAR 1
    story.append(Paragraph("Pillar I: Intelligent Sales, CAD Ingestion & Dynamic Pricing", h2_style))
    
    p1 = [
        ("1. Multimodal OCR for Trade Show Inquiries & Industrial RFQs",
         "<b>Workflow Pain Point:</b> Sales representatives collect hundreds of business cards and handwritten technical requirement sheets at industrial trade shows (e.g. IMTEX, ENGIMACH), resulting in delayed entry and lost leads.<br/>"
         "<b>AI Solution:</b> Vision-LLM integration (Gemini 1.5 Flash). Rep snaps a mobile photo; the model extracts company name, GSTIN, phone, and technical machine requirements (e.g. 'Looking for 800mm Y-axis stroke for brake disc machining'), creating a verified lead with zero manual typing."),

        ("2. CAD/Drawing-to-CNC Machine Recommendation Co-Pilot",
         "<b>Workflow Pain Point:</b> Prospects upload 2D component drawings (PDF) or 3D STEP CAD files, requiring senior application engineers to calculate machine stroke, cycle times, and spindle power.<br/>"
         "<b>AI Solution:</b> Component Dimension & Machinability Analyzer. Parses bounding dimensions, material hardness (e.g. EN8, Inconel, Cast Iron), and tolerance limits. Automatically recommends the ideal CNC model (e.g. ARG-VMC-700 vs. ARG-VMC-1000), optimal spindle RPM (8k vs 12k), and estimates cycle time."),

        ("3. Dynamic Deal Win-Probability & Margin Optimization Advisor",
         "<b>Workflow Pain Point:</b> Quotation discount requests above 10% are evaluated subjectively by Head Office, causing commercial delays and margin erosion.<br/>"
         "<b>AI Solution:</b> Machine Learning pricing model trained on historical won/lost quotes, competitor quotes (Haas, BFW), and customer LTV. Recommends: <i>'At 12% discount, Win Probability is 84%. Recommending approval. At 8% discount, Win Probability drops to 42% due to local Haas price matching.'</i>"),

        ("4. Autonomous AI Quotation Follow-Up Drafter",
         "<b>Workflow Pain Point:</b> Sent quotations languish without timely, value-driven follow-ups.<br/>"
         "<b>AI Solution:</b> Generative AI monitors quote age. On Day 3, 7, and 14, it drafts hyper-personalized technical follow-up messages highlighting specific ROI calculations (e.g. electricity savings and cycle time reduction over legacy machines).")
    ]
    for title, desc in p1:
        story.append(Paragraph(title, bullet_title_style))
        story.append(Paragraph(desc, bullet_desc_style))

    story.append(Spacer(1, 4))

    # PILLAR 2
    story.append(Paragraph("Pillar II: Field Service, Computer Vision & Commissioning AI", h2_style))
    
    p2 = [
        ("5. Computer Vision Site-Readiness Pre-Inspection",
         "<b>Workflow Pain Point:</b> Service engineers frequently arrive at client factories only to abort installation because the concrete foundation isn't cured, 3-phase 415V power is unstable, or pneumatic lines are missing.<br/>"
         "<b>AI Solution:</b> Customer uploads 3 photos before engineer dispatch: (1) Machine foundation pad, (2) Electrical breaker & voltage stabilizer, (3) Compressor line. A Computer Vision classifier verifies floor levelness and electrical rating, eliminating wasted engineer travel."),

        ("6. Calibration Dial Gauge & Quality Audit Vision Inspector",
         "<b>Workflow Pain Point:</b> Step 3 of installation involves leveling and dial indicator backlash testing. Manual checklist entry is vulnerable to human error or technician shortcuts.<br/>"
         "<b>AI Solution:</b> The engineer snaps a photo of the magnetic base dial gauge reading. OCR and needle-angle vision detection read the deflection (e.g. <i>0.008 mm runout</i>) and certify calibration tolerances automatically."),

        ("7. Digital Signature Biometric & Geolocation Verification",
         "<b>Workflow Pain Point:</b> Customer sign-off in <code>/installations/[id]</code> unlocks final milestone payments and warranty initiation.<br/>"
         "<b>AI Solution:</b> Signature stroke biometric check ensuring the signature was rendered smoothly on the touchscreen by human hand, capturing GPS location and timestamp validation to prevent proxy sign-offs.")
    ]
    for title, desc in p2:
        story.append(Paragraph(title, bullet_title_style))
        story.append(Paragraph(desc, bullet_desc_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: PILLAR III & PILLAR IV
    # =========================================================================
    story.append(Paragraph("Pillar III: Industrial Diagnostics & 4-Hour SLA Defense", h2_style))
    
    p3 = [
        ("8. CNC Controller Alarm Code Intelligent Diagnostic Copilot",
         "<b>Workflow Pain Point:</b> Customers log tickets stating cryptic alarm codes (e.g. 'Fanuc Alarm 401: V-Ready Off' or 'Siemens 21612: Channel 1 Axis Enable Reset') without diagnostic context.<br/>"
         "<b>AI Solution:</b> Domain-trained RAG (Retrieval-Augmented Generation) indexing OEM controller manuals, electrical schematics, and Argus engineering bulletins. When a ticket is created, AI immediately outputs: (1) Root Cause, (2) Top 3 components to test (IGBT module, DC link fuse, servo amplifier), and (3) Exact spare part SKUs to pull from local franchise inventory."),

        ("9. Acoustic Vibration Spindle Health Analyzer (Audio AI)",
         "<b>Workflow Pain Point:</b> Machine operators hear abnormal chatter, hum, or squeal from the spindle at 6,000 RPM but cannot assess severity.<br/>"
         "<b>AI Solution:</b> Operator records a 5-second audio clip on their smartphone and attaches it to the support ticket. An audio spectrogram model classifies the sound: normal harmonic vibration, worn ceramic spindle bearing, tool unbalance, or loose drive belt, diagnosing failure before catastrophic spindle seizure."),

        ("10. SLA Breach Predictive Alert & Dynamic Route Dispatcher",
         "<b>Workflow Pain Point:</b> Critical breakdowns have a strict 4-hour SLA. If an engineer gets delayed in traffic, the SLA breaches, hurting customer trust.<br/>"
         "<b>AI Solution:</b> Predictive SLA guardian. If an engineer has not updated comments or checked in on-site after 90 minutes from ticket creation, AI triggers an escalation notification to the Head Office Service Director and suggests dispatching the nearest secondary engineer via geographic proximity.")
    ]
    for title, desc in p3:
        story.append(Paragraph(title, bullet_title_style))
        story.append(Paragraph(desc, bullet_desc_style))

    story.append(Spacer(1, 6))

    # PILLAR 4
    story.append(Paragraph("Pillar IV: Aftermarket Revenue, Predictive Renewals & Upsell Intelligence", h2_style))
    
    p4 = [
        ("11. Autonomous WhatsApp Conversational AMC Renewal Agent",
         "<b>Workflow Pain Point:</b> Franchise sales teams struggle to manually track and call clients for warranty-to-AMC transitions at 60d, 30d, and 7d intervals.<br/>"
         "<b>AI Solution:</b> Automated AI WhatsApp Agent. 30 days before expiration, it messages the customer's Plant Head: <i>'Hello Mr. Karthik, your VMC-700 warranty expires on Jan 15. Your machine completed 2,100 production hours with 0 spindle faults. Would you like to renew with Comprehensive Spindle Cover for ₹72,000?'</i> Handles FAQs, answers coverage questions, and sends a digital renewal invoice."),

        ("12. Risk-Adjusted Dynamic AMC Pricing Engine",
         "<b>Workflow Pain Point:</b> Currently AMC prices are flat-rate, meaning harsh machining environments (cast iron foundry) pay the same as clean aluminum prototyping shops, hurting service profitability.<br/>"
         "<b>AI Solution:</b> Predictive Risk Model analyzing machine age, breakdown ticket frequency, duty cycle, and environment. Recommends dynamic AMC contract tiers (Silver, Gold, Platinum) with risk-adjusted pricing."),

        ("13. Fleet Analytics & Precision Upsell Matrix",
         "<b>Workflow Pain Point:</b> In <code>/customers/[id]</code>, upsell recommendations are currently static heuristic cards.<br/>"
         "<b>AI Solution:</b> Machine Learning Next-Best-Offer. Analyzes client industry (e.g. Aerospace vs Auto), active machine fleet, and past part orders. Automatically suggests high-margin accessories with compelling business cases: e.g. <i>'Client operates 2 VMC-700s in auto-valves. Recommend 4th-Axis Rotary Table (SKU: ARG-ACC-ROT-4) to reduce setup time from 4 ops to 1 op.'</i>")
    ]
    for title, desc in p4:
        story.append(Paragraph(title, bullet_title_style))
        story.append(Paragraph(desc, bullet_desc_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: PILLAR V & TECHNICAL ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("Pillar V: Executive Governance, Territory Intelligence & Conversational OS", h2_style))
    
    p5 = [
        ("14. 'Argus Intelligence' Universal Natural Language Assistant (OS Copilot)",
         "<b>Workflow Pain Point:</b> Executives and franchise owners navigate multiple screens to extract operational answers.<br/>"
         "<b>AI Solution:</b> Embedded AI conversational bar in the top navigation. Users ask natural language queries: <i>'Which Coimbatore clients have overdue 70% dispatch payments?', 'Show all critical breakdown tickets resolved under 2 hours this month', 'What is our quote conversion rate for 5-axis machines?'</i> AI generates real-time MongoDB aggregation answers with direct clickable links."),

        ("15. Predictive Cash Flow & Milestone Collection Forecaster",
         "<b>Workflow Pain Point:</b> Head Office finance cannot accurately predict next month's cash inflows because the 70% pre-dispatch payment timing varies by customer.<br/>"
         "<b>AI Solution:</b> Predictive time-series model analyzing historical payment turnaround times, customer credit behavior, and factory lead times to forecast cash inflows with 92%+ confidence intervals."),

        ("16. AI Territory Potential & Franchise Quota Benchmark Engine",
         "<b>Workflow Pain Point:</b> Franchise annual targets in <code>/ho/franchises</code> are currently set manually without external market data.<br/>"
         "<b>AI Solution:</b> Geospatial & Industrial MSME analyzer. Cross-references assigned district postal PIN codes with regional industrial census data (active CNC machine shops, auto-clusters, defense parks) to calculate realistic franchise sales quotas and identify underserved territories.")
    ]
    for title, desc in p5:
        story.append(Paragraph(title, bullet_title_style))
        story.append(Paragraph(desc, bullet_desc_style))

    story.append(Spacer(1, 10))

    # TECHNICAL ARCHITECTURE
    story.append(Paragraph("3. Technical Implementation Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=1, spaceAfter=6))
    story.append(Paragraph(
        "To maintain the high-speed Next.js 14 architecture without disrupting current production workflows, we propose a modular, cloud-native AI pipeline:", body_style
    ))

    arch_data = [
        [
            Paragraph("Component Layer", table_header_style),
            Paragraph("Recommended Stack", table_header_style),
            Paragraph("Role & Integration Strategy", table_header_style)
        ],
        [
            Paragraph("<b>Multimodal AI Foundation</b>", table_cell_bold),
            Paragraph("Google Gemini 1.5 Pro / Flash & Claude 3.5 Sonnet", table_cell_style),
            Paragraph("Ultra-fast multimodal reasoning for CAD drawings, site readiness photos, controller alarm manual RAG, and executive conversational search.", table_cell_style)
        ],
        [
            Paragraph("<b>Vector Store & Embeddings</b>", table_cell_bold),
            Paragraph("MongoDB Atlas Vector Search (native to existing DB)", table_cell_style),
            Paragraph("Zero new infrastructure needed! Index CNC machine error manuals, component catalogs, and customer history directly in existing Atlas database.", table_cell_style)
        ],
        [
            Paragraph("<b>AI Microservices / Endpoints</b>", table_cell_bold),
            Paragraph("Next.js Server Actions / API Routes + FastAPI (Python)", table_cell_style),
            Paragraph("Lightweight LLM prompts handled directly via Next.js route handlers (<code>/api/ai/...</code>); heavy CAD/audio models hosted on modular FastAPI container.", table_cell_style)
        ],
        [
            Paragraph("<b>Messaging & Edge Channels</b>", table_cell_bold),
            Paragraph("Twilio / Meta WhatsApp Cloud API + Webhooks", table_cell_style),
            Paragraph("Powers autonomous conversational renewal notifications and customer service ticket status updates directly on WhatsApp.", table_cell_style)
        ]
    ]

    arch_table = Table(arch_data, colWidths=[120, 184, 200])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT])
    ]))
    story.append(arch_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: ROADMAP & ROI & CONCLUSION
    # =========================================================================
    story.append(Paragraph("4. Implementation Roadmap & Business ROI", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=1, spaceAfter=6))
    
    roadmap_data = [
        [
            Paragraph("Phase & Horizon", table_header_style),
            Paragraph("Deliverables & Capabilities", table_header_style),
            Paragraph("Expected Business Metric Impact", table_header_style)
        ],
        [
            Paragraph("<b>Phase 1: Quick Wins</b><br/>(Weeks 1 - 4)<br/><i>Low Complexity</i>", table_cell_bold),
            Paragraph("• Business card / Trade show OCR to Lead creation<br/>"
                      "• CNC Alarm Code Diagnostic Assistant in Support Tickets<br/>"
                      "• AI Quotation Follow-up Email Generator<br/>"
                      "• Natural Language Search Bar ('Argus Intelligence')", table_cell_style),
            Paragraph("<b>+40% Faster Lead Entry</b><br/>"
                      "<b>-35% Diagnostic Time</b> on support breakdown tickets<br/>"
                      "Zero new infrastructure overhead.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 2: Core Automation</b><br/>(Weeks 5 - 8)<br/><i>Medium Complexity</i>", table_cell_bold),
            Paragraph("• Autonomous WhatsApp AMC Renewal Agent<br/>"
                      "• Computer Vision Site-Readiness Pre-Inspection<br/>"
                      "• Dynamic Deal Win-Probability & Discount Advisor<br/>"
                      "• Risk-adjusted AMC contract tiers", table_cell_style),
            Paragraph("<b>+28% AMC Renewal Rate</b><br/>"
                      "<b>-50% Aborted Installation Visits</b><br/>"
                      "Higher quotation margins and faster approvals.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 3: Deep Industrial AI</b><br/>(Weeks 9 - 14)<br/><i>High Differentiation</i>", table_cell_bold),
            Paragraph("• CAD Drawing-to-Machine Selection Co-pilot<br/>"
                      "• Acoustic Spindle Vibration Failure Predictor<br/>"
                      "• Predictive Cash Inflow & Milestone Forecaster<br/>"
                      "• Dial Gauge Calibration Vision Verifier", table_cell_style),
            Paragraph("<b>Industry-First CNC Partner OS</b><br/>"
                      "<b>+15% Spindle Service Revenue</b><br/>"
                      "Unmatched competitive moat against Haas/BFW.", table_cell_style)
        ]
    ]

    road_table = Table(roadmap_data, colWidths=[120, 214, 170])
    road_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_HEADER),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT])
    ]))
    story.append(road_table)
    story.append(Spacer(1, 10))

    # CONCLUSION
    story.append(Paragraph("5. Conclusion & Actionable Recommendation", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=1, spaceAfter=6))
    
    closing_text = (
        "The Argus Franchise Operating System has established an exceptionally clean and well-structured foundation. "
        "Every core entity—from organizations, franchises, and postal territory rules to milestone payment schedules and commissioning signatures—"
        "is already cleanly structured in TypeScript and MongoDB.<br/><br/>"
        "<b>Immediate Next Step:</b> We recommend starting with <b>Phase 1 Quick Wins</b>—specifically embedding the "
        "<b>'Argus Intelligence' Conversational OS Copilot</b> and the <b>CNC Alarm Code Troubleshooting RAG</b> into the existing Next.js App Router. "
        "These can be shipped in under two weeks using MongoDB Atlas Vector Search and Gemini 1.5, delivering immediate visible value to franchise dealers and service engineers without altering existing database schemas."
    )
    story.append(Paragraph(closing_text, body_style))
    story.append(Spacer(1, 10))

    signoff_data = [
        [
            Paragraph("<b>Report Prepared By:</b> Advanced Agentic Engineering Team", body_style),
            Paragraph("<b>Status:</b> Ready for Executive Review", body_style)
        ],
        [
            Paragraph("<b>Platform:</b> Argus Franchise Operating System", body_style),
            Paragraph("<b>Next Milestone:</b> Phase 1 Architecture Prototype", body_style)
        ]
    ]
    signoff_table = Table(signoff_data, colWidths=[250, 254])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(signoff_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    out_dir = r"e:\ARGUS TECHNOLOGIES\PROJECTS\Argus Franchise Operating System"
    out_file = os.path.join(out_dir, "Argus_FOS_AI_Integration_Strategy.pdf")
    create_ai_strategy_pdf(out_file)
