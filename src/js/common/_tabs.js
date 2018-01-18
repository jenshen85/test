module.exports = function() {
  
  let contentWrapp = Array.from(document.getElementsByClassName('content-wrapp'));
  let tabs = Array.from(document.getElementsByClassName('admin-tabs__link'));
  let tabsWrap = document.getElementById('admin-tabs__list');
  let activeTab = 'admin-tabs__link--active';
  
  window.onload = function () {

    for( i = 0; i < tabs.length; i++ ) {    
      tabs[i].onclick = function(e) {
        e.preventDefault()
      };
    };

    hideTabsContent (1);

  }

  tabsWrap.onclick = function (event) {
    let target = event.target;
    if ( target.className === 'admin-tabs__link' ) {
      for ( i = 0; i < tabs.length; i++ ) {
        if (target === tabs[i]) {
          showTabsContent(i);
          break;
        }
      }
    }
  }

  function  hideTabsContent(a) {
    for( i = a; i < contentWrapp.length; i++ ) {
      contentWrapp[i].classList.remove('show');
      contentWrapp[i].classList.add('hide');
      tabs[i].classList.remove(activeTab)
    }
  }

  function showTabsContent (j) {
    if (contentWrapp[j].classList.contains('hide')) {
      hideTabsContent(0);
      tabs[j].classList.add(activeTab);
      contentWrapp[j].classList.remove('hide');
      contentWrapp[j].classList.add('show');
    }
  }
}