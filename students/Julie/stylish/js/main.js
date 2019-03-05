let index = 0; let dotIndex = 0;

// 等靜態 HTML DOM 長好了才開始跑
document.addEventListener("DOMContentLoaded", () => {
  
    // 初始畫面
    campaigns();
    // 判斷網址是否有 category 或 tag 參數，有的話就要跑出正確畫面（方便各 Page 共用 NavBar）
    let url = new URL(location.href)
    let catas = url.searchParams.get('category');
    let tag = url.searchParams.get('tag');
    if (catas === 'women') {
        console.log(catas);
        catalog("women");
    } else if (catas === 'men') {
        console.log(catas);
        catalog("men");
    } else if (catas === 'accessories') {
        console.log(catas);
        catalog("accessories");
    } else if (tag !== null ) {
        search(tag);
    } else {
        catalog("all");
    }
    // 每 10 秒輪播 Campaign
    setInterval(next, 10000);

    // 按 tab 變字體顏色
    toggleMutiple(document.querySelectorAll('.item'), "activeTab", "A");

    // 把 tab id 當作網址的 End Point 傳給 Fetch，按到哪個 tab 就傳那個 tab 的 id 
    const tabs = document.querySelectorAll('.item');
    for (let i = 0; i < tabs.length; i++) {
        let tab = tabs[i].id;

        function tabListen(e) {
        if (e.currentTarget.id === tab) {
                clear(document.getElementById('row'));
                catalog(tab);
            } else {
                console.log(e.currentTarget.id);
                console.log(tab);
            }
        }
        tabs[i].addEventListener('click', tabListen);
    }

});

// 自動輪播功能
function next() {
  slides[index].classList.remove("in");
  slides[index].classList.add("out");
  dots[dotIndex].classList.remove("activeDot");
  dots[dotIndex].classList.add("dot");

  index = (index+1) % slides.length;
  dotIndex = (dotIndex+1) % dots.length;

  slides[index].classList.remove("out");
  slides[index].classList.add("in");
  dots[dotIndex].classList.add("activeDot");
  dots[dotIndex].classList.remove("dot");
}