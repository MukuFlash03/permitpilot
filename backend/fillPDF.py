from pdfrw import PdfReader, PdfWriter
from pdfrw.buildxobj import pagexobj
from pdfrw.objects.pdfdict import PdfDict
import logging
import os


# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def list_form_fields(template):
    """
    List all fillable form fields in the PDF.
    Returns a dictionary of field names and their current values.
    """
    fields = {}
    
    for page in template.pages:
        if '/Annots' not in page:
            logger.warning("No annotations found on page")
            continue
            
        annotations = page['/Annots']
        if annotations is None:
            logger.warning("Annotations is None")
            continue
            
        for idx, annotation in enumerate(annotations):
            if annotation['/Subtype'] == '/Widget':
                field_name = annotation['/T']
                field_value = annotation['/V'] if '/V' in annotation else None
                field_type = annotation['/FT'] if '/FT' in annotation else 'Unknown'
                fields[field_name] = {
                    'value': field_value,
                    'type': field_type
                }
                logger.debug(f"Found field: {field_name} (Type: {field_type}, Current Value: {field_value})")
    
    return fields

def fill_pdf_form(input_pdf_path, output_pdf_path, form_data):
    """
    Fill a PDF form with given data.
    
    Args:
        input_pdf_path (str): Path to the input PDF form
        output_pdf_path (str): Path where to save the filled PDF
        form_data (dict): Dictionary with field names as keys and values to fill
    """
    logger.info(f"Reading PDF from: {input_pdf_path}")
    
    try:
        template = PdfReader(input_pdf_path)
        logger.info(f"Successfully read PDF, number of pages: {len(template.pages)}")
    except Exception as e:
        logger.error(f"Failed to read PDF: {e}")
        raise
    
    # First, list all available fields
    logger.info("Analyzing form fields...")
    available_fields = list_form_fields(template)
    logger.info(f"Available fields in PDF: {list(available_fields.keys())}")
    logger.info(f"Data to be filled: {form_data}")
    
    # Check for mismatched fields
    for field_name in form_data:
        if field_name not in available_fields:
            logger.warning(f"Field '{field_name}' from input data not found in PDF form")
    
    fields_filled = 0
    
    # Fill in the form fields
    for page in template.pages:
        if '/Annots' not in page:
            logger.warning("No annotations found on page")
            continue
            
        annotations = page['/Annots']
        if annotations is None:
            logger.warning("Annotations is None")
            continue
            
        for annotation in annotations:
            if annotation['/Subtype'] == '/Widget':
                field_name = annotation['/T']
                
                if field_name in form_data:
                    try:
                        # Get the field type if available
                        field_type = annotation['/FT'] if '/FT' in annotation else 'Unknown'
                        logger.debug(f"Filling field '{field_name}' (Type: {field_type}) with value: {form_data[field_name]}")
                        
                        annotation.update(
                            PdfDict(
                                V=str(form_data[field_name]),
                                AS=str(form_data[field_name])
                            )
                        )
                        fields_filled += 1
                        logger.debug(f"Successfully filled field '{field_name}'")
                    except Exception as e:
                        logger.error(f"Error filling field '{field_name}': {e}")
    
    logger.info(f"Filled {fields_filled} fields")
    
    # Write the filled PDF to a new file
    try:
        logger.info(f"Writing filled PDF to: {output_pdf_path}")
        PdfWriter().write(output_pdf_path, template)
        logger.info("Successfully wrote PDF")
    except Exception as e:
        logger.error(f"Failed to write PDF: {e}")
        raise

# Example usage
if __name__ == "__main__":
    # Example form data
    sample_data = {
        '(New Facility requires plan submittal)': 'Yes',
        '(Change of Ownership)': 'No',
        '(Name of Business DBA)': "Smith's Restaurant",
        '(Business Phone)': '(555) 123-4567',
        '(Business Address include street directions and suite number if applicable)': '123 Main Street, Suite 101',
        '(City)': 'Los Angeles',
        '(Zip)': '90001',
        '(Business EMail)': 'contact@smithsrestaurant.com',
        '(Seating  Bed Capacity Licensed Healthcare)': '50',
        '(Square Footage)': '2000',
        '(T)': '9:00 AM - 10:00 PM',
        '(W)': '9:00 AM - 10:00 PM',
        '(Th)': '9:00 AM - 10:00 PM',
        '(F)': '9:00 AM - 11:00 PM',
        '(Sa)': '9:00 AM - 11:00 PM',
        '(Su)': 'Closed',
        '(undefined)': '',
        '(Start Time)': '9:00 AM',
        '(Closing Time)': '10:00 PM',
        '(24 Hrs)': 'No',
        '(First Date of Operation)': '2023-01-15',
        '(IndividualSole Proprietorship)': 'No',
        '(Partnership)': 'No',
        '(LP)': 'No',
        '(LLP)': 'No',
        '(Corporation)': 'No',
        '(LLC)': 'Yes',
        '(Business Owner)': 'John Smith',
        '(Owner Phone)': '(555) 234-5678',
        '(Owners Address must be different than Business Address and cannot be a PO Box)': '456 Elm Street',
        '(City_2)': 'Los Angeles',
        '(State)': 'CA',
        '(Zip_2)': '90002',
        '(Drivers License Numbers if Sole Proprietorship or Partnership attach copy of ID)': '',
        '(Owner EMail)': 'owner@smithsrestaurant.com',
        '(Emergency Contact)': 'Jane Doe',
        '(Emergency Phone)': '(555) 345-6789',
        '(Billing Contact Name)': 'Billing Department',
        '(Billing Contact Phone)': '(555) 456-7890',
        '(Billing Mailing Address include street directions and suite number if applicable)': '789 Oak Avenue, Suite 202',
        '(City_3)': 'Los Angeles',
        '(State_2)': 'CA',
        '(Zip_3)': '90003',
        '(Print Name)': 'John Smith',
        '(Title)': 'Owner',
        '(Signature)': 'John Smith',
        '(Date)': '2023-01-15',
        '(Amount Owed to be determined by Specialist on date of approval)': '$500',
        '(Payment Due By)': '2023-02-01',
        '(PE Code)': '12345',
        '(PE Description)': 'Food Service',
        '(Billing Status)': 'Pending',
        '(Specialist Name)': 'Sarah Johnson',
        '(Conditional Approval to Operate Date)': '2023-01-20',
        '(Program Identifier)': 'FS-2023-001',
        '(FA)': 'N/A',
        '(PR)': 'N/A',
        '(SR)': 'N/A',
        '(Prior OW)': 'N/A',
        '(Prior AR)': 'N/A',
        '(Date of Payment)': '2023-01-25',
        '(Amount Received)': '$500',
        '(HSO Receipt Number)': '456789',
        '(OW)': 'No',
        '(AR)': 'No',
        '(Anniversary Date)': '2024-01-15',
        '(Application Verified By)': 'Michelle Lee'
    }
    
    try:
        fill_pdf_form(
            input_pdf_path=os.path.join(os.path.dirname(__file__), '../public/pdfs', 'FoodHealthPermitApplicationFillable.pdf'),
            output_pdf_path='filled_form.pdf',
            form_data=sample_data
        )
        print("PDF form filled successfully!")
    except Exception as e:
        print(f"Error filling PDF form: {e}")