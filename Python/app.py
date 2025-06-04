# from fpdf import FPDF

# # Certificate details
# company_name = "Daimora"
# certificate_title = "Partnership Certificate"
# recipient_name = "Mitali"
# date_of_issue = "March 18, 2025"
# signature_area = "Authorized Signature"
# stamp_area = "Company Stamp"
# secret_code = "DaiMoraSecret12345"  # Hidden code

# # Path to save PDF
# pdf_path = "D:/GIT/DiamoraAPI/Python/Daimora_Partnership_Certificate.pdf"

# # Path to logo
# logo_path = "D:/GIT/DiamoraAPI/Python/logo.png"  # Change this to your actual path

# # Create PDF
# pdf = FPDF(orientation='L', unit='mm', format='A4')
# pdf.add_page()

# # Set border
# pdf.set_draw_color(0, 0, 139)  # Dark blue border
# pdf.set_line_width(4)
# pdf.rect(10, 10, 277, 190)

# # Add Company Logo
# pdf.image(logo_path, x=20, y=15, w=50)  # Adjust position and size

# # Title Section
# pdf.set_font("Arial", 'B', 30)
# pdf.set_text_color(0, 0, 139)  # Dark blue
# pdf.cell(0, 20, company_name, ln=True, align='C')

# pdf.set_font("Arial", 'B', 24)
# pdf.cell(0, 20, certificate_title, ln=True, align='C')

# pdf.ln(10)

# # Recipient Section
# pdf.set_font("Arial", '', 18)
# pdf.set_text_color(0, 0, 0)
# pdf.cell(0, 12, "This certificate is proudly presented to", ln=True, align='C')

# pdf.set_font("Arial", 'B', 26)
# pdf.cell(0, 18, recipient_name, ln=True, align='C')

# pdf.ln(8)

# pdf.set_font("Arial", '', 16)
# pdf.cell(0, 12, f"For their valuable partnership with {company_name}.", ln=True, align='C')

# pdf.ln(12)

# # Date of Issue
# pdf.set_font("Arial", 'I', 14)
# pdf.cell(0, 10, f"Date of Issue: {date_of_issue}", ln=True, align='C')

# pdf.ln(20)

# # Signature and Stamp area
# pdf.set_font("Arial", '', 16)
# pdf.cell(130, 10, signature_area, border='T', ln=0, align='C')
# pdf.cell(20, 10, "")  # Spacer
# pdf.cell(130, 10, stamp_area, border='T', ln=1, align='C')

# # Embed Secret Code (Invisible)
# pdf.set_text_color(255, 255, 255)  # White text (invisible)
# pdf.set_font("Arial", '', 10)
# pdf.cell(0, 10, secret_code, ln=True, align='C')

# # Save PDF
# pdf.output(pdf_path, 'F')

# print(f"Certificate saved at: {pdf_path}")
# print(f"Secret Code: {secret_code}")  # Visible in runtime



from PIL import Image, ImageDraw, ImageFont

# Certificate details
company_name = "Daimora"
certificate_title = "Partnership Certificate"
recipient_name = "Mitali"
date_of_issue = "March 18, 2025"
signature_area = "Authorized Signature"
stamp_area = "Company Stamp"
secret_code = "DaiMoraSecret12345"  # Hidden code

# Paths
output_path = "D:/GIT/DiamoraAPI/Python/Daimora_Partnership_Certificate.png"
logo_path = "D:/GIT/DiamoraAPI/Python/logo.png"  # Ensure the logo exists at this path

# Create blank image (A4 Landscape size: 2480x1754 pixels)
img = Image.new('RGB', (2480, 1754), "white")
draw = ImageDraw.Draw(img)

# Load fonts (Ensure you have these fonts or update the path)
try:
    font_title = ImageFont.truetype("arial.ttf", 80)
    font_subtitle = ImageFont.truetype("arial.ttf", 60)
    font_text = ImageFont.truetype("arial.ttf", 40)
    font_signature = ImageFont.truetype("arial.ttf", 36)
    font_secret = ImageFont.truetype("arial.ttf", 20)  # Invisible code
except IOError:
    print("Error: Font file not found. Install Arial or specify a different font.")

# Draw border
border_color = (0, 0, 139)  # Dark Blue
border_thickness = 10
draw.rectangle([(border_thickness, border_thickness), (2480-border_thickness, 1754-border_thickness)], outline=border_color, width=border_thickness)

# Add Logo
try:
    logo = Image.open(logo_path)
    logo = logo.resize((250, 250))  # Resize if needed
    img.paste(logo, (100, 100))  # Adjust position
except IOError:
    print("Warning: Logo not found. Skipping logo addition.")

# Add text elements
text_color = (0, 0, 0)
blue_color = (0, 0, 139)

draw.text((1240, 250), company_name, font=font_title, fill=blue_color, anchor="mm")
draw.text((1240, 400), certificate_title, font=font_subtitle, fill=blue_color, anchor="mm")

draw.text((1240, 600), "This certificate is proudly presented to", font=font_text, fill=text_color, anchor="mm")
draw.text((1240, 700), recipient_name, font=font_subtitle, fill=blue_color, anchor="mm")

draw.text((1240, 850), f"For their valuable partnership with {company_name}.", font=font_text, fill=text_color, anchor="mm")
draw.text((1240, 950), f"Date of Issue: {date_of_issue}", font=font_text, fill=text_color, anchor="mm")

# Signature and Stamp
draw.text((620, 1300), signature_area, font=font_signature, fill=text_color, anchor="mm")
draw.text((1860, 1300), stamp_area, font=font_signature, fill=text_color, anchor="mm")

draw.line([(400, 1320), (840, 1320)], fill=text_color, width=4)  # Signature line
draw.line([(1640, 1320), (2080, 1320)], fill=text_color, width=4)  # Stamp line

# Invisible Secret Code
draw.text((1240, 1650), secret_code, font=font_secret, fill=(255, 255, 255), anchor="mm")  # White text

# Save image
img.save(output_path)
print(f"Certificate saved at: {output_path}")
print(f"Secret Code: {secret_code}")  # Visible in runtime
