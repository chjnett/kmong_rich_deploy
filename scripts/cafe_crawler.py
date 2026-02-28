
import time
import pandas as pd
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ==========================================
# 설정 (Configuration)
# ==========================================
TARGET_URL = "https://cafe.daum.net/WHCRP/VmtR"
EXCEL_FILENAME = "crawled_products.xlsx"

# 사용자 제공 선택자 (User Provided Selectors)
SELECTOR_LIST_ITEMS = "#article-list > li"  # 게시글 리스트 아이템 컨테이너
SELECTOR_LIST_LINK = "strong > a"           # 리스트 아이템 내부의 링크
SELECTOR_DETAIL_TEXT = "#article > p"       # 상세 페이지 내 텍스트 (본문)
SELECTOR_DETAIL_IMAGES = "#user_contents img" # 상세 페이지 내 이미지

# ==========================================
# 메인 크롤러 (Main Crawler)
# ==========================================
def main():
    print("크롬 드라이버 초기화 중...")
    options = webdriver.ChromeOptions()
    
    # -----------------------------------------------------------
    # [설정] Windows Chrome 계정 연동 (WSL 환경)
    # 기존에 로그인된 Windows 크롬 프로필을 그대로 사용합니다.
    # -----------------------------------------------------------
    
    # 1. Windows Chrome 실행 파일 경로 지정
    # Windows 환경에서 실행 중이므로 C:\ 경로를 사용해야 합니다.
    chrome_binary_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    options.binary_location = chrome_binary_path

    # 2. 유저 데이터 경로 (프로필) 설정 [수정됨]
    # 시스템 크롬 프로필(Default)을 직접 쓰면 충돌(Lock)이 자주 발생하여 크롬이 꺼집니다.
    # 대신 프로젝트 폴더 내에 별도의 프로필을 생성하여 로그인 정보를 저장합니다.
    import os
    current_path = os.path.dirname(os.path.abspath(__file__))
    profile_path = os.path.join(current_path, "chrome_profile")
    
    # Windows 경로 형식으로 변환 (C:\...)
    # WSL에서 Windows 경로로 인식시키기 위해 절대 경로 변환 필요
    # 그러나 WSL 상의 경로는 윈도우 크롬이 인식 못할 수 있으므로, 상대 경로 개념으로 접근하거나
    # 단순히 'chrome_profile' 폴더명을 지정하면 실행 위치 기준(Windows에서는 CMD 실행 위치)이 됩니다.
    # 안전하게 절대 경로를 찍되, WSL Path -> Windows Path 변환은 복잡하므로 
    # 간단히 현재 작업 디렉토리 하위의 "local_profile"을 쓰도록 설정합니다.
    
    # 여기서 중요: python이 WSL에서 돌면 os.getcwd()는 리눅스 경로입니다.
    # 하지만 chrome.exe는 윈도우 프로그램입니다.
    # 따라서 user-data-dir 인자는 "C:\Users\..." 형태여야 가장 안전합니다.
    # 충돌 방지를 위해 하드코딩된 'C:\temp\chrome_debug_profile' 등을 사용하는 것을 권장합니다.
    
    debug_profile_path = r"C:\chrome_debug_profile"
    if not os.path.exists("/mnt/c/chrome_debug_profile"):
        try:
            os.makedirs("/mnt/c/chrome_debug_profile", exist_ok=True)
        except:
            pass

    options.add_argument(f"user-data-dir={debug_profile_path}")
    
    print("="*60)
    print(f"⚠️  충돌 방지를 위해 독립된 프로필을 사용합니다: {debug_profile_path}")
    print("⚠️  [최초 1회] 로그인이 필요하며, 로그인 후에는 정보가 유지됩니다.")
    print("="*60)

    # 충돌 방지 및 안정성 옵션 추가
    # options.add_argument("--remote-debugging-port=9222") # 포트 충돌 가능성 있으므로 일단 제거
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    
    # options.add_argument("--headless") 
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        # [1단계] 크롬 브라우저 확인
        # print("="*60)
        # input(">>> [1단계] 브라우저가 열렸습니다. 크롬 계정(프로필)이 맞는지 확인 후 엔터(ENTER)를 누르세요 <<<")

        # 1. 로그인 페이지 이동
        print("로그인 페이지로 이동합니다...")
        driver.get("https://accounts.kakao.com/login?continue=https://cafe.daum.net/")
        time.sleep(2)
        
        # [2단계] 수동 로그인 대기
        print("="*60)
        print("❗ 자동 로그인이 아닌, 사용자가 직접 로그인을 수행합니다.")
        print("❗ 브라우저에서 '카카오계정으로 로그인'을 클릭하여 로그인을 완료해주세요.")
        input(">>> 로그인이 완료되어 메인 화면으로 넘어갔다면, 여기서 엔터(ENTER)를 누르세요 <<<")
        print("로그인 완료 확인됨. 3초 후 이동합니다...")
        time.sleep(3)

        # -----------------------------------------------------------
        # [추가] 중요 페이지 경유 로직
        # 요청하신 URL들을 순차적으로 방문하여 세션을 갱신하거나 경로를 확보합니다.
        # -----------------------------------------------------------
        print("경유 페이지 1: https://top.cafe.daum.net/")
        driver.get("https://top.cafe.daum.net/")
        time.sleep(3)

        print("경유 페이지 2: https://cafe.daum.net/WHCRP")
        driver.get("https://cafe.daum.net/WHCRP")
        time.sleep(3)

        # 2. 게시판 이동 (메뉴 클릭 방식)
        print(f"메뉴(#fldlink_VmtR_393)를 클릭하여 게시판으로 이동합니다...")
        
        try:
            # 메뉴가 로드될 때까지 잠시 대기 (로그인 후 페이지 리로드 가능성)
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "#fldlink_VmtR_393"))
            )
            menu_link = driver.find_element(By.CSS_SELECTOR, "#fldlink_VmtR_393")
            menu_link.click()
            time.sleep(3) # 페이지 이동 대기
            print("메뉴 클릭 성공.")
        except Exception as e:
            print(f"메뉴 클릭 실패 (직접 URL 이동 시도): {e}")
            driver.get(TARGET_URL)
            time.sleep(2)

        # 다음 카페는 보통 게시판 내용이 'down'이라는 이름의 iframe 안에 있습니다.
        try:
            driver.switch_to.frame("down")
            print("iframe 'down'으로 전환되었습니다.")
        except:
            print("iframe 'down'으로 전환 실패. 기본 컨텐츠에서 진행합니다.")

        # 3. 게시글 목록 수집
        # 리스트가 로드될 때까지 대기
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#article-list"))
        )
        
        articles = driver.find_elements(By.CSS_SELECTOR, SELECTOR_LIST_ITEMS)
        print(f"리스트에서 {len(articles)}개의 게시글을 발견했습니다.")

        article_links = []
        for arts in articles:
            try:
                link_el = arts.find_element(By.CSS_SELECTOR, SELECTOR_LIST_LINK)
                url = link_el.get_attribute("href")
                # 유효한 카페 링크인지 확인
                if url and "cafe.daum.net" in url:
                    article_links.append(url)
            except:
                continue
        
        print(f"크롤링할 링크 {len(article_links)}개를 수집했습니다.")

        # 4. 상세 내용 크롤링
        results = []
        
        for idx, link in enumerate(article_links):
            print(f"[{idx+1}/{len(article_links)}] 크롤링 중: {link}")
            
            # 상세 페이지로 이동
            # 주의: 다음 카페에서 직접 링크 이동 시 iframe 컨텍스트가 깨질 수 있으므로
            # url 이동 후 다시 iframe을 잡아주어야 합니다.
            driver.get(link)
            time.sleep(1.5)
            
            try:
                driver.switch_to.frame("down")
            except:
                pass

            try:
                # 텍스트 데이터 추출 (카테고리 / 가격 등 포함)
                text_elements = driver.find_elements(By.CSS_SELECTOR, SELECTOR_DETAIL_TEXT)
                full_text = "\n".join([el.text for el in text_elements])
                
                # 가격 추출 (간단한 로직: 숫자 찾기)
                # 예: 본문에 포함된 숫자 중 가격으로 추정되는 것 추출
                price_match = re.search(r'\b\d+\b', full_text)
                raw_price = price_match.group(0) if price_match else "0"
                
                # 이미지 추출
                img_elements = driver.find_elements(By.CSS_SELECTOR, SELECTOR_DETAIL_IMAGES)
                img_urls = [img.get_attribute("src") for img in img_elements if img.get_attribute("src")]
                
                # 이모티콘이나 아이콘 등 불필요한 이미지 필터링
                img_urls = [u for u in img_urls if "emoticon" not in u and "icon" not in u]

                # 데이터 구조 생성
                row = {
                    "external_url": link,
                    "full_text": full_text,
                    "price_raw": raw_price,
                    "image_files": ",".join(img_urls), # CSV 저장을 위해 콤마로 구분
                    "crawled_at": time.strftime("%Y-%m-%d %H:%M:%S")
                }
                results.append(row)
                
            except Exception as e:
                print(f"페이지 파싱 오류 {link}: {e}")

        # 5. 엑셀 저장
        if results:
            df = pd.DataFrame(results)
            
            df.to_excel(EXCEL_FILENAME, index=False)
            print(f"성공적으로 {len(results)}개의 항목을 {EXCEL_FILENAME}에 저장했습니다.")
        else:
            print("수집된 데이터가 없습니다.")

    except Exception as e:
        print(f"치명적인 오류 발생: {e}")
    finally:
        print("드라이버를 종료합니다...")
        driver.quit()

if __name__ == "__main__":
    main()
