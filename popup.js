let begin = false;

$('#authentication_button').on('click', () => {
  if (begin) {
    startGitHubOAuthProcess.githubOAuth();
  }
});

$('#index_URL').attr(
  'href', chrome.runtime.getURL('index.html')
);

$('#link_repo_redirect').attr(
  'href', chrome.runtime.getURL('index.html')
);

chrome.storage.local.get('githubAccessToken', (responseToken) => {
  const accessToken = responseToken.githubAccessToken;
  if (accessToken === null || accessToken === undefined) {
    begin = true;
    $('#authentication_phase').attr('style', 'display:inherit;');
  }
  else {
    const gitHubAPI_authURL = 'https://api.github.com/user';

    const xhttp = new XMLHttpRequest();
    xhttp.addEventListener('readystatechange', function () {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
          chrome.storage.local.get('current_phase', (phase) => {
            if (phase && phase.current_phase === 'solve_and_push') {
              $('#solve_and_push_phase').attr('style', 'display:inherit;');
              chrome.storage.local.get(
                ['userStatistics', 'github_LinkedRepository'],
                (userStats) => {
                  const { userStatistics } = userStats;
                  if (userStatistics && userStatistics.solved) {
                    $('#successful_submissions').text(userStatistics.solved);
                    $('#successful_submissions_school').text(userStatistics.school);
                    $('#successful_submissions_basic').text(userStatistics.basic);
                    $('#successful_submissions_easy').text(userStatistics.easy);
                    $('#successful_submissions_medium').text(userStatistics.medium);
                    $('#successful_submissions_hard').text(userStatistics.hard);
                    $('#current_streak').text(userStatistics.streak || 0);

                    if (userStatistics.sha && Object.keys(userStatistics.sha).length > 0) {
                      const langMap = {
                        'py': 'Python', 'cpp': 'C++', 'c': 'C', 'cs': 'C#', 'java': 'Java', 'js': 'JavaScript'
                      };
                      let dynamicLangCounts = userStatistics.languages;

                      if (!dynamicLangCounts || Object.keys(dynamicLangCounts).length === 0) {
                        dynamicLangCounts = {};
                        for (const fileKey of Object.keys(userStatistics.sha)) {
                          if (!fileKey.endsWith('.md')) {
                            const ext = fileKey.split('.').pop();
                            if (ext) {
                              dynamicLangCounts[ext] = (dynamicLangCounts[ext] || 0) + 1;
                            }
                          }
                        }
                      }

                      if (Object.keys(dynamicLangCounts).length > 0) {
                        $('#language_stats_container').empty();
                        for (const [ext, count] of Object.entries(dynamicLangCounts)) {
                          const langName = langMap[ext] || ext;
                          $('#language_stats_container').append(
                            `<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                               <span class="text-[10px] font-semibold text-slate-600 dark:text-slate-300">${langName}</span>
                               <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 rounded-sm">${count}</span>
                             </div>`
                          );
                        }
                      }
                    }
                  }
                  const gitHubLinkedRepository = userStats.github_LinkedRepository;
                  if (gitHubLinkedRepository) {
                    $('#repository_link').html(`<a target="_blank" href="https://github.com/${gitHubLinkedRepository}">${gitHubLinkedRepository}</a>`);
                  }
                },
              );
            }
            else {
              $('#link_repo_phase').attr('style', 'display:inherit;');
            }
          });
        }
        else if (xhttp.status === 401) {
          chrome.storage.local.set({ githubAccessToken: null }, () => {
            console.log('Something went wrong during authentication. Please try again after some time!',);
            begin = true;
            $('#authentication_phase').attr('style', 'display:inherit;');
          });
        }
      }
    });
    xhttp.open('GET', gitHubAPI_authURL, true);
    xhttp.setRequestHeader('Authorization', `token ${accessToken}`);
    xhttp.send();
  }
});