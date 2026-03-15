from playwright.sync_api import sync_playwright

def verify_feature(page):
    # Navigate to the Pasapalabra Setup Screen
    page.goto("http://localhost:4321", timeout=60000)
    page.wait_for_timeout(1000)

    # Check that custom radiogroups have the right label and a11y roles
    print("Finding 'Nivel de Dificultad' element...")
    difficulty_group = page.locator('div[role="radiogroup"][aria-labelledby="difficulty-select-label"]')
    difficulty_group.wait_for(state='visible')

    print("Clicking 'Fácil' option inside group...")
    easy_button = difficulty_group.locator('button[role="radio"]', has_text="Fácil")
    easy_button.click()
    page.wait_for_timeout(500)

    # Validate that it checked properly visually
    is_checked = easy_button.get_attribute("aria-checked")
    if is_checked != "true":
        raise Exception(f"Expected 'Fácil' to be checked, but aria-checked is {is_checked}")

    print("Finding 'Temática del Rosco' element...")
    category_group = page.locator('div[role="radiogroup"][aria-labelledby="category-select-label"]')
    category_group.wait_for(state='visible')

    print("Clicking 'Otro' option inside category group...")
    custom_category_button = category_group.locator('button[role="radio"]', has_text="Otro")
    custom_category_button.click()
    page.wait_for_timeout(500)

    print("Finding custom category text input with its aria-label...")
    custom_input = page.locator('input[aria-label="Escribe la temática personalizada"]')
    custom_input.wait_for(state='visible')
    custom_input.fill("Videojuegos")
    page.wait_for_timeout(500)

    # Take screenshot at the end
    page.screenshot(path="/app/verification.png")
    page.wait_for_timeout(1000)
    print("Verification completed successfully")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/app/video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()  # Important: close context to save the video
            browser.close()