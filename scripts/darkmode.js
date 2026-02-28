const updateTheme = (isDark) => {
  if (isDark) {
    $('html').addClass('dark');
  } else {
    $('html').removeClass('dark');
  }

  // Toggle images based on dark mode state
  let github_logo = isDark ? './assets/github_white.png' : './assets/github.png';
  $('.github_logo').attr('src', github_logo);
  let web_logo = isDark ? './assets/web_dark.png' : './assets/web_light.png';
  $('#web_logo').attr('src', web_logo);
  let mail_logo = isDark ? './assets/mail_dark.png' : './assets/mail_light.png';
  $('#mail_logo').attr('src', mail_logo);
};

// Initialize dark mode from storage on page load
chrome.storage.local.get(['darkmodeFlag'], function (darkmode_flag) {
  const isDark = darkmode_flag.darkmodeFlag === 1;
  $('#darkmode-toggle').prop('checked', isDark);
  updateTheme(isDark);
});

$('#darkmode-toggle').change(function () {
  const isDark = $(this).is(':checked');
  updateTheme(isDark);
  // Persist preference
  chrome.storage.local.set({ 'darkmodeFlag': isDark ? 1 : 0 });
});