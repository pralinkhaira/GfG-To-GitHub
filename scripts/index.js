const linkChoice = () => {
  return document.querySelector('input[name="radio"]:checked').value;
};

const githubRepository = () => {
  return $('#repositoryNameTextField').val().trim();
};

const createRepositoryStatusCode = (responseText, statusCode, repositoryName) => {
  switch (statusCode) {
    case 304:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').text(`Error creating ${repositoryName} - Unable to modify repository. Try again later!`,);
      $('#error_info').show();
      break;

    case 400:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').text(`Error creating ${repositoryName} - Bad POST request, make sure you're not overriding any existing scripts.`,);
      $('#error_info').show();
      break;

    case 401:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').text(`Error creating ${repositoryName} - Unauthorized access to repo. Try again later!`,);
      $('#error_info').show();
      break;

    case 403:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').text(`Error creating ${repositoryName} - Forbidden access to repository. Try again later!`,);
      $('#error_info').show();
      break;

    case 422:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').text(`Error creating ${repositoryName} - Unprocessable Entity. Repository may have already been created. Try Linking this repository instead.`,);
      $('#error_info').show();
      break;

    default:
      chrome.storage.local.set({ current_phase: 'solve_and_push' }, () => {
        $('#error_info').hide();
        $('#success_acknowledgement').html(`Successfully created <a target="blank" href="${responseText.html_url}">${repositoryName}</a>. Start solving on <a href="https://www.geeksforgeeks.org/explore">GeeksforGeeks</a> now!`,);
        $('#success_acknowledgement').show();
        $('#unlinkRepository').show();

        document.getElementById('link_repo_phase').style.display = 'none';
        document.getElementById('solve_and_push_phase').style.display = 'inherit';
      });

      chrome.storage.local.set(
        { github_LinkedRepository: responseText.full_name }, () => {
          console.log('Linked Repository Successfully.');
        },
      );
      break;
  }
};

const createRepository = (accessToken, repositoryName) => {
  const repositoryAuthenticationURL = 'https://api.github.com/user/repos';
  let name = repositoryName;
  let repositoryInit = {
    name,
    private: true,
    auto_init: true,
    description: 'This repository serves as a collection of my solutions to various GeeksforGeeks Data Structures and Algorithms (DSA) problems, organized by the level of difficulty. - Created using [GfG To GitHub](https://github.com/pralinkhaira/GfG-To-GitHub)',
  };
  repositoryInit = JSON.stringify(repositoryInit);

  const xhttp = new XMLHttpRequest();
  xhttp.addEventListener('readystatechange', function () {
    if (xhttp.readyState === 4) {
      createRepositoryStatusCode(JSON.parse(xhttp.responseText), xhttp.status, repositoryName);
    }
  });

  xhttp.open('POST', repositoryAuthenticationURL, true);
  xhttp.setRequestHeader('Authorization', `token ${accessToken}`);
  xhttp.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhttp.send(repositoryInit);
};

const linkRepoStatusCode = (statusCode, repositoryName) => {
  let linkFlag = false;
  switch (statusCode) {
    case 301:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').html(
        `Error linking <a target="blank" href="${`https://github.com/${repositoryName}`}">${repositoryName}</a> to 'GfG To GitHub'. <br> This repository has been moved permenantly. Try creating a new one.`,
      );
      $('#error_info').show();
      break;

    case 403:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').html(
        `Error linking <a target="blank" href="${`https://github.com/${repositoryName}`}">${repositoryName}</a> to 'GfG To GitHub'. <br> Forbidden action. Please make sure you have the right access to this repository.`,
      );
      $('#error_info').show();
      break;

    case 404:
      $('#success_acknowledgement').hide();
      $('#unlinkRepository').hide();
      $('#error_info').attr("style", "display: block; line-height: 1;");
      $('#error_info').html(`Error linking <a target="blank" href="${`https://github.com/${repositoryName}`}">${repositoryName}</a> to 'GfG To GitHub'. <br> Resource not found. Make sure you enter the right repository name.`,);
      $('#error_info').show();

      break;

    default:
      linkFlag = true;
      $('#unlinkRepository').show();
      break;
  }
  return linkFlag;
};

const linkRepo = (accessToken, repositoryName) => {
  const repositoryAuthenticationURL = `https://api.github.com/repos/${repositoryName}`;

  const xhttp = new XMLHttpRequest();
  xhttp.addEventListener('readystatechange', function () {
    if (xhttp.readyState === 4) {
      const responseText = JSON.parse(xhttp.responseText);
      const linkFlag = linkRepoStatusCode(xhttp.status, repositoryName);
      if (xhttp.status === 200) {
        if (!linkFlag) {

          chrome.storage.local.set({ current_phase: 'link_repo' }, () => {
            console.log(`Error linking ${repositoryName}.`);
          });

          chrome.storage.local.set({ github_LinkedRepository: null }, () => {
            console.log('Set Repository link to null');
          });

          document.getElementById('link_repo_phase').style.display = 'inherit';
          document.getElementById('solve_and_push_phase').style.display = 'none';
        }

        else {
          chrome.storage.local.set(
            { current_phase: 'solve_and_push', repo: responseText.html_url },
            () => {
              $('#error_info').hide();
              $('#success_acknowledgement').html(`Successfully linked <a target="blank" href="${responseText.html_url}">${repositoryName}</a> to 'GfG To GitHub'. Start solving on <a href="https://www.geeksforgeeks.org/explore">GeeksforGeeks</a>&nbsp; now!`,);
              $('#success_acknowledgement').show();
              $('#unlinkRepository').show();
              $(
                `<a target="_blank" href="https://github.com/pralinkhaira/GfG-To-GitHub/tree/main" class="inline-flex mt-6 items-center justify-center gap-2 group mx-auto px-4 py-1.5 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/30 transition-all shadow-sm">
            <svg class="h-4 w-4 text-yellow-500 group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-semibold text-yellow-500">Star us on GitHub</span>
          </a>`
              ).appendTo('#title');
            },
          );

          chrome.storage.local.set(
            { github_LinkedRepository: responseText.full_name }, () => {
              console.log('Linked Repository Successfully');
              chrome.storage.local.get('userStatistics', (solvedProblems) => {
                const { userStatistics } = solvedProblems;
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
                          `<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] transition-colors">
                               <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">${langName}</span>
                               <span class="text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 rounded text-center">${count}</span>
                             </div>`
                        );
                      }
                    }
                  }
                }
              });
            },
          );
          document.getElementById('link_repo_phase').style.display = 'none';
          document.getElementById('solve_and_push_phase').style.display = 'inherit';
        }
      }
    }
  });

  xhttp.open('GET', repositoryAuthenticationURL, true);
  xhttp.setRequestHeader('Authorization', `token ${accessToken}`);
  xhttp.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhttp.send();
};

const unlinkRepository = () => {
  chrome.storage.local.set({ current_phase: 'link_repo' }, () => {
    console.log(`Repository Unlinked`);
  });

  chrome.storage.local.set({ github_LinkedRepository: null }, () => {
    console.log('Set Repository link to null.');
  });

  document.getElementById('link_repo_phase').style.display = 'inherit';
  document.getElementById('solve_and_push_phase').style.display = 'none';
};

$(document).ready(function () {
  $('#radio_box').change(function () {
    selected_value = $("input[name='contacts']:checked").val();
    if (selected_value) {
      $('#linkRepositoryButton').attr('disabled', false);
    }
    else {
      $('#linkRepositoryButton').attr('disabled', true);
    }
  });
});
$('#linkRepositoryButton').on('click', () => {

  if (!linkChoice()) {
    $('#error_info').text('Please select an option!',);
    $('#error_info').show();
  }

  else if (!githubRepository()) {
    $('#error_info').text(
      'Please enter the name of your GitHub Repository!',
    );
    $('#repositoryNameTextField').focus();
    $('#error_info').show();
  }

  else {
    $('#error_info').hide();
    $('#success_acknowledgement').text('Please wait. Setting up things for you! ');
    $('#success_acknowledgement').show();

    chrome.storage.local.get('githubAccessToken', (gitHubToken) => {
      const accessToken = gitHubToken.githubAccessToken;
      if (accessToken === null || accessToken === undefined) {
        $('#error_info').text('Authorization error - GfG To GitHub does not have access to your GitHub account. Launch extension and click on Authenticate to grant access',);
        $('#error_info').show();
        $('#success_acknowledgement').hide();
      }

      else if (linkChoice() === 'create') {
        createRepository(accessToken, githubRepository());
        console.log("Successfully Created New Repository!");
      }

      else {
        chrome.storage.local.get('githubUsername', (github_username) => {
          const username = github_username.githubUsername;
          if (!username) {
            $('#error_info').text('Authorization error - GfG To GitHub does not have access to your GitHub account. Launch extension and click on Authenticate to grant access',);
            $('#error_info').show();
            $('#success_acknowledgement').hide();
          }
          else {
            linkRepo(accessToken, `${username}/${githubRepository()}`, false);
            console.log("Successfully Linked Repository!");
          }
        });
      }
    });
  }
});

$('#unlinkRepository a').on('click', () => {
  unlinkRepository();
  $('#unlinkRepository').hide();
  $('#success_acknowledgement').text('Successfully unlinked current GitHub Repository. Please Create/Link a new GitHub Repository.',);
});

chrome.storage.local.get('current_phase', (phase) => {
  const getPhase = phase.current_phase;
  if (getPhase && getPhase === 'solve_and_push') {
    chrome.storage.local.get('githubAccessToken', (gitHubToken) => {
      const accessToken = gitHubToken.githubAccessToken;
      if (accessToken === null || accessToken === undefined) {
        $('#error_info').text(
          'Authorization error - GfG To GitHub does not have access to your GitHub account. Launch extension and click on Authenticate to grant access',
        );
        $('#error_info').show();
        $('#success_acknowledgement').hide();

        document.getElementById('link_repo_phase').style.display = 'inherit';
        document.getElementById('solve_and_push_phase').style.display = 'none';
      }
      else {
        chrome.storage.local.get('github_LinkedRepository', (repoName) => {
          const linkedRepository = repoName.github_LinkedRepository;
          if (!linkedRepository) {
            $('#error_info').text('Improper Authorization error - Grant GfG To GitHub access to your GitHub account to continue (click GfG To GitHub extension on the top right to proceed)',);
            $('#error_info').show();
            $('#success_acknowledgement').hide();

            document.getElementById('link_repo_phase').style.display = 'inherit';
            document.getElementById('solve_and_push_phase').style.display = 'none';
          }

          else {
            linkRepo(accessToken, linkedRepository);
          }
        });
      }
    });
    document.getElementById('link_repo_phase').style.display = 'none';
    document.getElementById('solve_and_push_phase').style.display = 'inherit';
  }

  else {
    document.getElementById('link_repo_phase').style.display = 'inherit';
    document.getElementById('solve_and_push_phase').style.display = 'none';
  }
});
