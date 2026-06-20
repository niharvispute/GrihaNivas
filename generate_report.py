"""
Grihanivas — June 2026 Development Report PDF
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image, PageBreak, KeepTogether, NextPageTemplate
)
from reportlab.platypus import PageTemplate as RLPageTemplate
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas as pdfcanvas
import os

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "UIchanges")
OUT = os.path.join(BASE, "Grihanivas_Development_Report_June2026.pdf")

STEP_IMAGES = [
    ("Step 1 — Basic Information",        os.path.join(IMG_DIR, "basic_information_step_1",  "screen.png")),
    ("Step 2 — Location & Configuration", os.path.join(IMG_DIR, "location_config_step_2",   "screen.png")),
    ("Step 3 — Media & Documents",        os.path.join(IMG_DIR, "media_documents_step_3",    "screen.png")),
    ("Step 4 — Pricing & Inventory",      os.path.join(IMG_DIR, "pricing_inventory_step_4",  "screen.png")),
    ("Step 5 — Review & Publish",         os.path.join(IMG_DIR, "review_publish_step_5",     "screen.png")),
]

# Palette
PRIMARY  = colors.HexColor("#2F6FED")
DARK     = colors.HexColor("#0F172A")
SLATE    = colors.HexColor("#334155")
MUTED    = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#F1F5F9")
ACCENT   = colors.HexColor("#FF7A1A")
SUCCESS  = colors.HexColor("#16A34A")
WHITE    = colors.white
BORDER   = colors.HexColor("#E2E8F0")
TAG_BG   = colors.HexColor("#EFF6FF")

W, H = A4
MARGIN = 18 * mm


# ─── Canvas callbacks ──────────────────────────────────────────────────────────

def draw_cover(canv, doc):
    canv.saveState()
    # Full dark background
    canv.setFillColor(DARK)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    # Blue top band
    canv.setFillColor(PRIMARY)
    canv.rect(0, H * 0.52, W, H * 0.48, stroke=0, fill=1)
    # Decorative circles
    canv.setFillColor(colors.HexColor("#1E40AF"))
    canv.circle(W * 0.85, H * 0.72, 90, stroke=0, fill=1)
    canv.setFillColor(colors.HexColor("#1D4ED8"))
    canv.circle(W * 0.1, H * 0.62, 55, stroke=0, fill=1)
    # Orange accent bar
    canv.setFillColor(ACCENT)
    canv.rect(MARGIN, H * 0.52 - 5, 50, 4, stroke=0, fill=1)
    # Title block (drawn directly, not as flowable)
    x = MARGIN
    # Tag
    canv.setFillColor(ACCENT)
    canv.setFont("Helvetica-Bold", 8)
    canv.drawString(x, H * 0.52 + 200, "GRIHANIVAS  ·  MUMBAI REAL ESTATE PLATFORM")
    # Main title
    canv.setFillColor(WHITE)
    canv.setFont("Helvetica-Bold", 34)
    canv.drawString(x, H * 0.52 + 158, "Development")
    canv.drawString(x, H * 0.52 + 118, "Progress Report")
    # Subtitle
    canv.setFont("Helvetica", 13)
    canv.setFillColor(colors.HexColor("#CBD5E1"))
    canv.drawString(x, H * 0.52 + 92, "June 2026  ·  Sprint Delivery Summary")
    # Orange underline
    canv.setFillColor(ACCENT)
    canv.rect(x, H * 0.52 + 82, 48, 2, stroke=0, fill=1)
    # Description
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#94A3B8"))
    canv.drawString(x, H * 0.52 + 64,
        "This report documents all features built, database & API changes made,")
    canv.drawString(x, H * 0.52 + 52,
        "and UI enhancements delivered in the June 2026 development sprint.")
    # Credits
    canv.setFont("Helvetica-Bold", 8)
    canv.setFillColor(colors.HexColor("#64748B"))
    canv.drawString(x, H * 0.52 + 28, "Prepared by:")
    canv.setFont("Helvetica", 8)
    canv.setFillColor(WHITE)
    canv.drawString(x + 60, H * 0.52 + 28, "Rohit Huge & Vishal Jangid — Engineering Team")
    canv.setFont("Helvetica-Bold", 8)
    canv.setFillColor(colors.HexColor("#64748B"))
    canv.drawString(x, H * 0.52 + 16, "Prepared for:")
    canv.setFont("Helvetica", 8)
    canv.setFillColor(WHITE)
    canv.drawString(x + 60, H * 0.52 + 16, "Grihanivas Leadership — Shree Gurudev Properties")

    # Stats strip (bottom half)
    items = [
        ("17", "New API Endpoints"),
        ("3",  "New DB Models"),
        ("5",  "Wizard Steps"),
        ("76", "Dev Tasks Completed"),
        ("3",  "New Admin Routes"),
    ]
    strip_y = H * 0.14
    col = (W - 2 * MARGIN) / len(items)
    for i, (val, lbl) in enumerate(items):
        bx = MARGIN + i * col
        canv.setFillColor(colors.HexColor("#1E293B"))
        canv.roundRect(bx + 4, strip_y, col - 8, 68, 6, stroke=0, fill=1)
        canv.setFillColor(ACCENT)
        canv.setFont("Helvetica-Bold", 22)
        canv.drawCentredString(bx + col / 2, strip_y + 38, val)
        canv.setFillColor(colors.HexColor("#94A3B8"))
        canv.setFont("Helvetica", 7.5)
        for j, part in enumerate(lbl.split(" ", 1)):
            canv.drawCentredString(bx + col / 2, strip_y + 22 - j * 11, part)

    # Footer
    canv.setFillColor(colors.HexColor("#0F172A"))
    canv.rect(0, 0, W, H * 0.09, stroke=0, fill=1)
    canv.setFillColor(colors.HexColor("#1E293B"))
    canv.setFont("Helvetica", 7.5)
    canv.setFillColor(colors.HexColor("#475569"))
    canv.drawCentredString(W / 2, H * 0.04, "Grihanivas — Confidential  ·  June 2026  ·  contact@grihanivas.in")
    canv.restoreState()


def draw_page(canv, doc):
    canv.saveState()
    # Top accent bar
    canv.setFillColor(PRIMARY)
    canv.rect(0, H - 10 * mm, W, 10 * mm, stroke=0, fill=1)
    # Logo text in top bar
    canv.setFillColor(WHITE)
    canv.setFont("Helvetica-Bold", 10)
    canv.drawString(MARGIN, H - 6.5 * mm, "Grihanivas")
    canv.setFont("Helvetica", 8)
    canv.setFillColor(colors.HexColor("#BFDBFE"))
    canv.drawString(MARGIN + 62, H - 6.5 * mm, "Development Report — June 2026")
    canv.setFont("Helvetica", 8)
    canv.setFillColor(WHITE)
    canv.drawRightString(W - MARGIN, H - 6.5 * mm, f"Page {doc.page}")
    # Bottom footer
    canv.setFillColor(LIGHT_BG)
    canv.rect(0, 0, W, 13 * mm, stroke=0, fill=1)
    canv.setStrokeColor(BORDER)
    canv.setLineWidth(0.5)
    canv.line(0, 13 * mm, W, 13 * mm)
    canv.setFont("Helvetica", 7.5)
    canv.setFillColor(MUTED)
    canv.drawString(MARGIN, 5 * mm, "Grihanivas — Shree Gurudev Properties  ·  Confidential")
    canv.drawRightString(W - MARGIN, 5 * mm, "contact@grihanivas.in")
    canv.restoreState()


# ─── Styles ────────────────────────────────────────────────────────────────────

def make_styles():
    base = getSampleStyleSheet()
    def add(name, **kw):
        if name not in base:
            base.add(ParagraphStyle(name=name, **kw))
    add("Body",       fontName="Helvetica",      fontSize=9,    textColor=SLATE,   leading=14, spaceAfter=3)
    add("Bold",       fontName="Helvetica-Bold", fontSize=9,    textColor=DARK,    leading=14, spaceAfter=3)
    add("SmallMuted", fontName="Helvetica",      fontSize=7.5,  textColor=MUTED,   leading=11)
    add("Bullet",     fontName="Helvetica",      fontSize=8.5,  textColor=SLATE,   leading=13, leftIndent=10, spaceAfter=2)
    add("SubBullet",  fontName="Helvetica",      fontSize=8,    textColor=MUTED,   leading=12, leftIndent=20, spaceAfter=1)
    add("Caption",    fontName="Helvetica",      fontSize=7.5,  textColor=MUTED,   leading=10, alignment=TA_CENTER)
    add("SectionIntro", fontName="Helvetica",    fontSize=9,    textColor=MUTED,   leading=14, spaceAfter=6, alignment=TA_JUSTIFY)
    add("PageTitle",  fontName="Helvetica-Bold", fontSize=16,   textColor=DARK,    leading=20, spaceAfter=4)
    add("Mono",       fontName="Courier",        fontSize=8,    textColor=DARK,    leading=11)
    return base

S = make_styles()


# ─── Helpers ───────────────────────────────────────────────────────────────────

def sp(h=4):    return Spacer(1, h * mm)
def hr():       return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=4, spaceBefore=4)
def bul(text):  return Paragraph(f"•  {text}", S["Bullet"])
def sbul(text): return Paragraph(f"◦  {text}", S["SubBullet"])
def bd(text):   return Paragraph(text, S["Bold"])
def body(text): return Paragraph(text, S["Body"])


class SectionBand(Flowable):
    def __init__(self, title, sub=None):
        super().__init__()
        self.title = title
        self.sub   = sub
        self.aw    = W - 2 * MARGIN
        self._h    = 30 if sub else 22

    def wrap(self, aw, ah):
        self.aw = aw
        return (aw, self._h)

    def draw(self):
        c = self.canv
        c.setFillColor(DARK)
        c.roundRect(0, 0, self.aw, self._h, 5, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(10, self._h - 14, self.title)
        if self.sub:
            c.setFont("Helvetica", 7.5)
            c.setFillColor(colors.HexColor("#94A3B8"))
            c.drawString(10, 5, self.sub)


def model_block(name, color, fields):
    avail = W - 2 * MARGIN
    hdr = Table(
        [[Paragraph(f"<b>{name}</b>", ParagraphStyle(
            name=f"_mh{name}", fontSize=9.5, textColor=WHITE,
            fontName="Helvetica-Bold", leading=12))]],
        colWidths=[avail]
    )
    hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), color),
        ("TOPPADDING",    (0,0),(-1,-1), 6), ("BOTTOMPADDING",(0,0),(-1,-1), 6),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
    ]))
    rows = [[Paragraph(
        f"<font color='#{color.hexval()[2:]}'>▸</font>  {f}",
        ParagraphStyle(name=f"_mf{i}", fontSize=8.5, textColor=SLATE, leading=13)
    )] for i, f in enumerate(fields)]
    body_t = Table(rows, colWidths=[avail])
    body_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), LIGHT_BG),
        ("TOPPADDING",    (0,0),(-1,-1), 3), ("BOTTOMPADDING",(0,0),(-1,-1), 3),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("LINEBELOW",     (0,0),(-1,-2), 0.3, BORDER),
        ("BOX",           (0,0),(-1,-1), 0.5, BORDER),
    ]))
    return KeepTogether([hdr, body_t, sp(4)])


def stat_row(stats):
    avail = W - 2 * MARGIN
    col   = avail / len(stats)
    top   = [Paragraph(f"<b>{v}</b>", ParagraphStyle(
                name=f"_sv{i}", fontSize=20, textColor=c, leading=22, alignment=TA_CENTER))
             for i, (_, v, c) in enumerate(stats)]
    bot   = [Paragraph(l, ParagraphStyle(
                name=f"_sl{i}", fontSize=7, textColor=MUTED, leading=9, alignment=TA_CENTER))
             for i, (l, _, _) in enumerate(stats)]
    t = Table([top, bot], colWidths=[col]*len(stats))
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), LIGHT_BG),
        ("TOPPADDING",    (0,0),(-1,0),  10), ("BOTTOMPADDING",(0,0),(-1,0),  2),
        ("TOPPADDING",    (0,1),(-1,1),  2),  ("BOTTOMPADDING",(0,1),(-1,1),  10),
        ("BOX",           (0,0),(-1,-1), 0.5, BORDER),
        ("INNERGRID",     (0,0),(-1,-1), 0.5, BORDER),
    ]))
    return t


def api_group(name, color, endpoints):
    avail = W - 2 * MARGIN
    MC = {"GET": colors.HexColor("#0891B2"), "POST": colors.HexColor("#16A34A"),
          "PUT": colors.HexColor("#D97706"),  "PATCH": colors.HexColor("#7C3AED"),
          "DELETE": colors.HexColor("#DC2626")}
    hdr = Table(
        [[Paragraph(f"<b>{name}</b>", ParagraphStyle(
            name=f"_gh{name}", fontSize=8.5, textColor=WHITE,
            fontName="Helvetica-Bold", leading=11))]],
        colWidths=[avail]
    )
    hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), color),
        ("TOPPADDING",    (0,0),(-1,-1), 5), ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
    ]))
    rows = []
    for method, path, desc in endpoints:
        mc = MC.get(method, MUTED)
        rows.append([
            Paragraph(f"<b>{method}</b>", ParagraphStyle(
                name=f"_m{method}{path}", fontSize=7.5, textColor=mc,
                fontName="Helvetica-Bold", leading=10)),
            Paragraph(f"<font face='Courier' size='7.5'>{path}</font>",
                      ParagraphStyle(name=f"_p{path}", fontSize=8, textColor=DARK, leading=10)),
            Paragraph(desc, S["SmallMuted"]),
        ])
    bt = Table(rows, colWidths=[36, 190, avail - 226])
    bt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), WHITE),
        ("TOPPADDING",    (0,0),(-1,-1), 5), ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8), ("RIGHTPADDING", (0,0),(-1,-1), 6),
        ("LINEBELOW",     (0,0),(-1,-2), 0.3, BORDER),
        ("BOX",           (0,0),(-1,-1), 0.5, BORDER),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
    ]))
    return KeepTogether([hdr, bt, sp(4)])


def step_img(path, caption):
    if not os.path.exists(path):
        return body(f"[Image missing: {caption}]")
    from PIL import Image as PILImg
    with PILImg.open(path) as im:
        iw, ih = im.size
    avail = W - 2 * MARGIN
    max_h = 88 * mm
    scale = min(avail / iw, max_h / ih)
    rw, rh = iw * scale, ih * scale
    img = Image(path, width=rw, height=rh)
    cap = Paragraph(caption, S["Caption"])
    t = Table([[img], [cap]], colWidths=[avail])
    t.setStyle(TableStyle([
        ("ALIGN",         (0,0),(-1,-1), "CENTER"),
        ("TOPPADDING",    (0,0),(-1,-1), 0), ("BOTTOMPADDING",(0,0),(-1,-1), 3),
        ("LEFTPADDING",   (0,0),(-1,-1), 0), ("RIGHTPADDING", (0,0),(-1,-1), 0),
        ("BOX",           (0,0),(-1,0),  0.8, BORDER),
        ("BACKGROUND",    (0,0),(-1,0),  WHITE),
    ]))
    return t


def change_block(num, title, color, points):
    avail = W - 2 * MARGIN
    hdr = Table([[
        Paragraph(f"<b>{num}</b>", ParagraphStyle(
            name=f"_cn{num}", fontSize=11, textColor=WHITE,
            fontName="Helvetica-Bold", leading=13)),
        Paragraph(f"<b>{title}</b>", ParagraphStyle(
            name=f"_ct{num}", fontSize=9.5, textColor=WHITE,
            fontName="Helvetica-Bold", leading=13)),
    ]], colWidths=[20, avail - 20])
    hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), color),
        ("TOPPADDING",    (0,0),(-1,-1), 7), ("BOTTOMPADDING",(0,0),(-1,-1), 7),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
    ]))
    rows = [[Paragraph(
        f"<font color='#{color.hexval()[2:]}'>▸</font>  {p}",
        ParagraphStyle(name=f"_cp{num}{i}", fontSize=8.5, textColor=SLATE, leading=13)
    )] for i, p in enumerate(points)]
    bt = Table(rows, colWidths=[avail])
    bt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), WHITE),
        ("TOPPADDING",    (0,0),(-1,-1), 4), ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("LINEBELOW",     (0,0),(-1,-2), 0.3, BORDER),
        ("BOX",           (0,0),(-1,-1), 0.5, BORDER),
    ]))
    return KeepTogether([hdr, bt, sp(5)])


# ─── Page content builders ────────────────────────────────────────────────────

def build_toc(story):
    story.append(sp(6))
    story.append(Paragraph("Table of Contents", S["PageTitle"]))
    story.append(hr())
    story.append(sp(3))
    rows = [
        ("A",    "Project Management Module — Overview",         "3"),
        ("A1",   "Database & Schema Changes",                    "3"),
        ("A2",   "API & Backend Changes",                        "4"),
        ("A3",   "Admin Frontend — 5-Step Project Wizard",       "5"),
        ("A3.1", "Step 1 — Basic Information",                   "6"),
        ("A3.2", "Step 2 — Location & Configuration",            "7"),
        ("A3.3", "Step 3 — Media & Documents",                   "8"),
        ("A3.4", "Step 4 — Pricing & Inventory",                 "9"),
        ("A3.5", "Step 5 — Review & Publish",                   "10"),
        ("A4",   "Admin Projects List Page",                    "11"),
        ("B",    "Platform-Wide UI Changes — June 2026",         "12"),
    ]
    avail = W - 2 * MARGIN
    data  = []
    for code, label, pg in rows:
        main = len(code) <= 2
        fn   = "Helvetica-Bold" if main else "Helvetica"
        fs   = 9.5 if main else 8.5
        ind  = 0 if main else (8 if "." not in code else 18)
        fc   = DARK if main else SLATE
        lp   = Paragraph(
            f"<b>{code}</b>  {label}" if main else f"    {code}  {label}",
            ParagraphStyle(name=f"_tl{code}", fontName=fn, fontSize=fs,
                           textColor=fc, leading=14, leftIndent=ind)
        )
        pp   = Paragraph(pg, ParagraphStyle(name=f"_tp{code}", fontName=fn, fontSize=fs,
                                             textColor=MUTED, leading=14, alignment=TA_RIGHT))
        data.append([lp, pp])

    t = Table(data, colWidths=[avail - 22, 22])
    t.setStyle(TableStyle([
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LINEBELOW",     (0,0),(-1,-2), 0.3, BORDER),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
    ]))
    story.append(t)
    story.append(PageBreak())


def build_section_a(story):
    story.append(sp(4))
    story.append(SectionBand(
        "SECTION A — Project Management Module",
        "Fully featured 5-step wizard for creating, editing, and publishing real-estate projects with unit inventory"
    ))
    story.append(sp(4))
    story.append(Paragraph(
        "The Project Management Module is the flagship feature delivered in this sprint. It enables administrators "
        "to list new real-estate projects — from basic details and RERA compliance through media uploads, "
        "unit inventory management (including bulk CSV/XLSX import), configuration-level pricing, and "
        "final SEO-optimised publishing — all through a guided 5-step wizard with save-on-advance persistence.",
        S["SectionIntro"]
    ))
    story.append(sp(3))
    story.append(stat_row([
        ("New API Endpoints",   "17", PRIMARY),
        ("New DB Models",       "3",  SUCCESS),
        ("Wizard Steps",        "5",  ACCENT),
        ("Dev Tasks Done",      "76", colors.HexColor("#7C3AED")),
        ("New Admin Routes",    "3",  colors.HexColor("#0891B2")),
    ]))
    story.append(sp(6))


def build_a1(story):
    story.append(SectionBand("A1 — Database & Schema Changes",
                             "Three new Mongoose models; 11 new fields added to Project"))
    story.append(sp(4))

    story.append(model_block("Project (extended)", PRIMARY, [
        "30+ total fields covering all aspects of a real-estate project listing",
        "contactPerson, contactPhone — point-of-contact fields for project enquiries",
        "pricePerSqft — price per square foot for quick buyer calculations",
        "maintenanceCharges — maintenance/other charges (text field)",
        "reraVerified (Boolean) — RERA compliance verification flag shown as badge",
        "enablePriceRequest, enableCallback, enableBrochureDownload — lead capture toggle flags",
        "whatsappCtaEnabled, enableSiteVisit — additional lead capture configuration toggles",
        "projectType enum extended: residential / commercial / mixed / plotting (plotting is new)",
        "gallery capacity raised from 10 → 20 images",
        "seoTitle, seoDescription, slug — full SEO & canonical URL support",
        "listingStatus — draft / active / archived lifecycle management",
    ]))
    story.append(model_block("ProjectConfiguration (new model)", SUCCESS, [
        "Parent reference: projectId — links to parent Project document",
        "bhkType enum: studio / 1BHK / 2BHK / 3BHK / 4BHK / 4+BHK / penthouse",
        "carpetAreaMin, carpetAreaMax — carpet area range in sq.ft",
        "bathrooms, balconies, parking — integer count fields",
        "totalUnits — total unit count for this BHK configuration",
        "priceMin, priceMax — configuration-level price range",
        "floorPlans[] — array of Cloudinary image URLs, one per floor plan upload",
    ]))
    story.append(model_block("ProjectUnit (new model)", ACCENT, [
        "Parent references: projectId + configurationId",
        "tower, block, floor, unitNumber — full physical address of the unit",
        "carpetArea, builtupArea — area measurements in sq.ft",
        "facing, viewType — orientation and view type details",
        "price — individual unit-level price",
        "status enum: available / hold / booked / sold",
        "notes — free-text remarks field for internal use",
    ]))
    story.append(PageBreak())


def build_a2(story):
    story.append(sp(4))
    story.append(SectionBand("A2 — API & Backend Changes",
                             "17 new REST endpoints + upload middleware upgrades + server-side XLSX parsing"))
    story.append(sp(4))

    story.append(api_group("Project Core  (7 endpoints)", PRIMARY, [
        ("GET",    "/api/projects/admin",         "Paginated admin list with search, status filter, builder filter"),
        ("POST",   "/api/projects",               "Create new project in draft status (multipart/form-data)"),
        ("GET",    "/api/projects/:id",           "Fetch full project document including configurations"),
        ("PUT",    "/api/projects/:id",           "Update project fields + media uploads (multipart)"),
        ("DELETE", "/api/projects/:id",           "Permanently delete project and all related sub-documents"),
        ("PATCH",  "/api/projects/:id/status",    "Change listing status: draft / active / archived"),
        ("PATCH",  "/api/projects/:id/featured",  "Toggle featured flag for homepage spotlighting"),
    ]))
    story.append(api_group("BHK Configurations  (3 endpoints)", SUCCESS, [
        ("POST",   "/api/projects/:id/configurations",          "Add new BHK configuration to a project"),
        ("PUT",    "/api/projects/project-configurations/:id",   "Update config fields + floor plan uploads"),
        ("DELETE", "/api/projects/project-configurations/:id",   "Remove a BHK configuration"),
    ]))
    story.append(api_group("Unit Inventory  (5 endpoints)", ACCENT, [
        ("GET",    "/api/projects/:id/units",         "List units with tower/floor/config/status filters"),
        ("POST",   "/api/projects/:id/units",         "Add single unit to inventory"),
        ("PUT",    "/api/projects/project-units/:id", "Update unit details or status"),
        ("DELETE", "/api/projects/project-units/:id", "Remove a unit from inventory"),
        ("GET",    "/api/projects/:id/units/export",  "Download full inventory as .xlsx file"),
    ]))
    story.append(api_group("Bulk Import  (2 endpoints)", colors.HexColor("#7C3AED"), [
        ("POST", "/api/projects/:id/bulk-import-units", "Import units from a JSON array in request body"),
        ("POST", "/api/projects/:id/bulk-import-file",  "Upload CSV or XLSX file — parsed server-side via xlsx package"),
    ]))

    story.append(sp(3))
    story.append(bd("Additional Backend Changes"))
    story.append(sp(1))
    for item in [
        "Gallery upload middleware: max image count raised 10 → 20; total file limit raised 13 → 23",
        "New CSV/XLSX file filter middleware (csvXlsxFilter + bulkImportUpload) added to upload.js",
        "New npm dependency: xlsx package installed for server-side Excel and CSV parsing",
        "Bug fix: missing createdBy in adminProjectController.create — caused HTTP 500 on every project create",
        "Bug fix: admin role now bypasses listingStatus: active filter when listing units for draft projects",
        "Bug fix: slug field added to Zod project.update schema — was silently stripped before reaching controller",
        "Zod validation schemas extended for all 11 new Project fields across create, update, and list endpoints",
    ]:
        story.append(bul(item))
    story.append(PageBreak())


def build_a3_intro(story):
    story.append(sp(4))
    story.append(SectionBand("A3 — Admin Frontend: 5-Step Project Wizard",
                             "Save-on-advance — data persisted to backend at every step"))
    story.append(sp(4))
    story.append(Paragraph(
        "The wizard uses a <b>save-on-advance</b> architecture: pressing Next saves the current step to the "
        "backend before navigating forward. The draft project survives page refreshes, Save as Draft works at "
        "every step trivially, and the edit flow pre-populates all fields from a single GET call.",
        ParagraphStyle(name="_wi", fontSize=9, textColor=SLATE, leading=14, spaceAfter=6)
    ))

    avail = W - 2 * MARGIN
    arch_data = [
        [bd("Step"), bd("On Next — what gets saved"), bd("Endpoint")],
        [body("Step 1"), body("Creates project (draft)"), Paragraph("<font face='Courier' size='7'>POST /api/projects</font>", S["Body"])],
        [body("Step 2"), body("Location, scale, BHK configs"), Paragraph("<font face='Courier' size='7'>PUT /api/projects/:id\nPOST|PUT …/configurations</font>", S["Body"])],
        [body("Step 3"), body("Hero, gallery (20), master plan, brochure, floor plans per config"), Paragraph("<font face='Courier' size='7'>PUT /api/projects/:id (multipart)\nPUT …/configurations/:id</font>", S["Body"])],
        [body("Step 4"), body("Price summary + per-config pricing"), Paragraph("<font face='Courier' size='7'>PUT /api/projects/:id\nPUT …/configurations/:id</font>", S["Body"])],
        [body("Step 5"), body("SEO, lead toggles, RERA verified, publish"), Paragraph("<font face='Courier' size='7'>PUT /api/projects/:id\nPATCH …/:id/status</font>", S["Body"])],
    ]
    t = Table(arch_data, colWidths=[40, 200, avail - 240])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,0),  DARK),  ("TEXTCOLOR",(0,0),(-1,0), WHITE),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, LIGHT_BG]),
        ("TOPPADDING",    (0,0),(-1,-1), 5),     ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("GRID",          (0,0),(-1,-1), 0.4, BORDER),
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
    ]))
    story.append(t)
    story.append(sp(4))
    story.append(bd("Shared Infrastructure"))
    for item in [
        "ProjectFormContext — React Context: projectId, currentStep, goToStep, formData, updateFormData, isDirty",
        "WizardSidebar — Fixed 256px left panel matching admin nav width; step progress, % bar, support box",
        "WizardFooter — Sticky bottom bar: Back / Save as Draft / Next Phase with loading states",
        "Full edit flow: /admin/projects/:id/edit hydrates all wizard steps from GET /api/projects/:id",
        "Inline error banner on API failures; spinner on all async actions",
    ]:
        story.append(bul(item))
    story.append(PageBreak())


STEP_DETAILS = [
    (1, "Step 1 — Basic Information", STEP_IMAGES[0][1], [
        ("Project Name", ["Free text input; used to auto-generate SEO slug"]),
        ("Builder / Developer", ["Dropdown dynamically populated from GET /api/builders"]),
        ("Contact Person & Phone", ["Point-of-contact fields stored on the project document"]),
        ("RERA Number + RERA URL", ["Compliance fields; displayed as badge on project detail page"]),
        ("Project Type pills", ["Residential  ·  Commercial  ·  Mixed Use  ·  Plotting (new)"]),
        ("Project Status pills", ["New Launch  ·  Under Construction  ·  Ready To Move"]),
        ("BHK Configurations multi-select", ["Studio / 1BHK / 2BHK / 3BHK / 4BHK / 4+BHK / Penthouse — multi-select pills"]),
        ("On Next", ["POST /api/projects → creates draft; projectId stored in context for all following steps"]),
        ("Edit flow", ["All fields pre-populated on /admin/projects/:id/edit mount"]),
    ]),
    (2, "Step 2 — Location & Configuration", STEP_IMAGES[1][1], [
        ("Location fields", ["Locality / Area, City, State, Pincode, Full Address"]),
        ("Map placeholder", ["Pin icon + Adjust Location button — ready for Google Maps integration"]),
        ("Project Scale", ["Total Towers, Total Floors, Total Units, Land Area (sq.ft)"]),
        ("BHK Configuration cards", ["One card per selected BHK type with Edit and Delete actions"]),
        ("Add Configuration button", ["Opens ConfigSidePanel slide-in (400px)"]),
        ("ConfigSidePanel fields", [
            "BHK Type select — maps UI labels to backend enum (1 BHK → 1BHK)",
            "Config Title, Carpet Area Min/Max, Bathrooms, Balconies, Parking, Available Units",
            "Save calls POST (new config) or PUT (existing) on /api/projects/:id/configurations",
        ]),
        ("Config delete", ["Confirm dialog → DELETE /api/projects/project-configurations/:id"]),
    ]),
    (3, "Step 3 — Media & Documents", STEP_IMAGES[2][1], [
        ("Hero Image", ["Drag-drop or click; instant preview via URL.createObjectURL(); delete button"]),
        ("Project Gallery", ["Up to 20 images; thumbnail grid; per-image delete; removals queued and synced on Next"]),
        ("Master Plan", ["JPG/PNG up to 5 MB; preview shown immediately"]),
        ("Project Brochure", ["PDF up to 20 MB; shows filename + Replace button; uploaded on Next"]),
        ("Video URL", ["Embedded video link for the project detail page"]),
        ("Configuration Floor Plans", [
            "Tabbed by BHK type (one tab per configuration)",
            "Drag-drop zone per config; uploaded to each ProjectConfiguration document on Next",
            "Existing Cloudinary URLs shown in edit flow",
        ]),
        ("Upload strategy", ["All files staged locally; no API call until Next Phase — then multipart/form-data"]),
    ]),
    (4, "Step 4 — Pricing & Inventory", STEP_IMAGES[3][1], [
        ("Project Price Summary", ["Starting Price, Maximum Price, Price per Sq.Ft, Maintenance/Other Charges"]),
        ("Per-config Pricing cards", ["Inline priceMin/priceMax edit per BHK configuration; saved to ProjectConfiguration"]),
        ("Unit Inventory table", ["Columns: Tower, Floor, Unit No., Config, Carpet Area, Facing, Price, Status"]),
        ("Filter bar", ["Tower / Floor / Configuration / Status dropdowns; calls listUnits with active filters"]),
        ("Add Unit", ["UnitFormModal — full form; POST /api/projects/:id/units on submit"]),
        ("Edit / Delete unit", ["Edit → pre-populated modal → PUT; Delete → confirm → DELETE"]),
        ("Download Inventory", ["Exports filtered view as .xlsx via GET /api/projects/:id/units/export"]),
        ("Bulk Import Panel", [
            "Drag-drop zone for CSV or XLSX file",
            "Sent to POST /api/projects/:id/bulk-import-file; server parses via xlsx package",
            "Returns { inserted, failed, errors[] } shown in Validation Summary cards",
            "Download Template button — serves unit-import-template.csv from /public/templates/",
        ]),
    ]),
    (5, "Step 5 — Review & Publish", STEP_IMAGES[4][1], [
        ("Project Overview card", ["Hero + full details grid; Edit button jumps back to Step 1"]),
        ("Media Review", ["Hero, gallery thumbnails, master plan, brochure, video; Edit jumps to Step 3"]),
        ("Configuration Summary table", ["BHK / Carpet Area / Price Range / Bathrooms / Parking / Units / Floor Plan per row"]),
        ("Inventory Stats", ["Total / Available / Hold / Booked / Sold unit counts"]),
        ("Lead Capture toggles", [
            "Enable Price Request  ·  Callback Request  ·  Brochure Download",
            "WhatsApp CTA  ·  Enable Site Visit",
        ]),
        ("SEO fields", [
            "SEO Title (70-char counter), SEO Description (160-char counter)",
            "URL Slug (75-char counter) — auto-generated from project name; editable",
        ]),
        ("RERA Verified badge", ["Toggle button: Mark Verified / Mark Pending"]),
        ("Listing Status", ["Dropdown: Draft / Published"]),
        ("PUBLISH PROJECT", ["PATCH /api/projects/:id/status → redirects to /admin/projects on success"]),
        ("Save as Draft", ["Saves all Step 5 fields, sets status to draft, stays on page"]),
    ]),
]


def build_step_pages(story):
    for num, title, img_path, sections in STEP_DETAILS:
        story.append(sp(4))
        story.append(SectionBand(f"A3.{num} — {title}"))
        story.append(sp(4))
        story.append(step_img(img_path, f"Admin Wizard — {title}"))
        story.append(sp(4))
        for label, points in sections:
            story.append(bd(label))
            for p in points:
                story.append(sbul(p))
        story.append(PageBreak())


def build_a4(story):
    story.append(sp(4))
    story.append(SectionBand("A4 — Admin Projects List Page", "Route: /admin/projects"))
    story.append(sp(4))
    for item in [
        "Projects table: Name, Builder, Type, Status badge, Total Units, Price Range, Featured badge, Date",
        "Live search by project name",
        "Filter by Listing Status (All / Draft / Active / Archived)",
        "Filter by Builder / Developer",
        "Featured toggle per row — PATCH /api/projects/:id/featured",
        "Status change dropdown per row — PATCH /api/projects/:id/status",
        "Delete with confirmation dialog — DELETE /api/projects/:id",
        "Edit button → /admin/projects/:id/edit",
        "New Project button → /admin/projects/new",
        "Loading skeleton during API fetch; error state with retry option",
    ]:
        story.append(bul(item))
    story.append(PageBreak())


def build_section_b(story):
    story.append(sp(4))
    story.append(SectionBand(
        "SECTION B — Platform-Wide UI Changes",
        "General improvements and content updates — June 2026"
    ))
    story.append(sp(5))

    story.append(change_block("1", "EMI Calculator — Downloadable EMI Report", PRIMARY, [
        "A fully branded downloadable report is now generated from the EMI Calculator page",
        "Report header: EMI REPORT — Grihanivas with professional layout",
        "Loan Summary section: Loan Amount, Interest Rate, Tenure",
        "Computed outputs: Monthly EMI, Total Interest Payable, Total Amount Payable",
        "Rendered in a clean HTML/PDF format matching Grihanivas brand identity",
    ]))
    story.append(change_block("2", "Footer — Social Media Links Updated", ACCENT, [
        "YouTube channel link added to the footer social icons row",
        "Instagram profile link added: instagram.com/grihanivas_sgp",
        "LinkedIn icon removed from footer as per client direction",
    ]))
    story.append(change_block("3", "Footer — Contact Information Updated", SUCCESS, [
        "Office address updated: Heera Panna Shopping Complex, Powai Hiranandani Garden, Mumbai – 400076",
        "Contact email updated to: contact@grihanivas.in",
    ]))
    story.append(change_block("4", "Footer — Brand Tagline Added", colors.HexColor("#7C3AED"), [
        "Powered by Shree Gurudev Properties tagline added to the footer across all pages",
    ]))
    story.append(change_block("5", "Builder Page — Layout & Alignment Fix", colors.HexColor("#0891B2"), [
        "Builder directory page layout corrected — card alignment, grid spacing, and responsive behaviour improved",
        "Visual consistency now matches the rest of the admin and public-facing pages",
    ]))


def build_closing(story):
    story.append(PageBreak())

    class Closing(Flowable):
        def wrap(self, aw, ah): return (aw, 200)
        def draw(self):
            c = self.canv
            aw = self.canv._pagesize[0] - 2 * MARGIN
            c.setFillColor(DARK)
            c.roundRect(0, 0, aw, 200, 8, stroke=0, fill=1)
            # Top accent
            c.setFillColor(PRIMARY)
            c.roundRect(0, 194, aw, 6, 4, stroke=0, fill=1)
            # Text
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 18)
            c.drawCentredString(aw / 2, 158, "All 76 Development Tasks Complete")
            c.setFont("Helvetica", 9)
            c.setFillColor(colors.HexColor("#94A3B8"))
            c.drawCentredString(aw / 2, 136,
                "The Project Management Module and all June 2026 platform updates have been")
            c.drawCentredString(aw / 2, 123,
                "fully implemented and are ready for review and deployment.")
            c.setFillColor(ACCENT)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(aw / 2, 95,
                "Phase 0 (UI)  ✓    Phase 1 (API Wiring)  ✓    Phase 2 (Backend)  ✓    Phase 3 (New Fields)  ✓")
            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor("#64748B"))
            c.drawCentredString(aw / 2, 60, "Engineering Team: Rohit Huge & Vishal Jangid")
            c.drawCentredString(aw / 2, 47, "Grihanivas — Shree Gurudev Properties  ·  Mumbai  ·  June 2026")
            c.setFillColor(PRIMARY)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(aw / 2, 26, "contact@grihanivas.in")

    story.append(sp(8))
    story.append(Closing())


# ─── Build ────────────────────────────────────────────────────────────────────

def build():
    doc = BaseDocTemplate(
        OUT, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=16 * mm, bottomMargin=18 * mm,
        title="Grihanivas Development Report — June 2026",
        author="Rohit Huge & Vishal Jangid",
    )

    cover_frame   = Frame(0, 0, W, H, leftPadding=0, rightPadding=0,
                          topPadding=0, bottomPadding=0)
    content_frame = Frame(MARGIN, 18 * mm, W - 2 * MARGIN, H - 10 * mm - 18 * mm,
                          leftPadding=0, rightPadding=0, topPadding=4, bottomPadding=0)

    doc.addPageTemplates([
        RLPageTemplate(id="Cover",   frames=[cover_frame],   onPage=draw_cover),
        RLPageTemplate(id="Content", frames=[content_frame], onPage=draw_page),
    ])

    story = [NextPageTemplate("Cover"), PageBreak()]
    # Cover is drawn entirely by draw_cover canvas callback; no flowables needed
    story.append(NextPageTemplate("Content"))
    story.append(PageBreak())

    build_toc(story)
    build_section_a(story)
    build_a1(story)
    build_a2(story)
    build_a3_intro(story)
    build_step_pages(story)
    build_a4(story)
    build_section_b(story)
    build_closing(story)

    doc.build(story)
    print(f"PDF written to: {OUT}")


if __name__ == "__main__":
    build()
