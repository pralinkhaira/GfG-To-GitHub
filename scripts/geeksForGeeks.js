const codeLanguage = {
  C: '.c',
  'C++': '.cpp',
  'C#': '.cs',
  Java: '.java',
  Python: '.py',
  Python3: '.py',
  JavaScript: '.js',
  Javascript: '.js'
};

let successfulSubmissionFlag = true;

const uploadToGitHubRepository = (
  githubAccessToken,
  linkedRepository,
  solution,
  problemTitle,
  uploadFileName,
  sha,
  commitMessage,
  problemDifficulty,
) => {
  const uploadPathURL = `https://api.github.com/repos/${linkedRepository}/contents/${problemDifficulty}/${problemTitle}/${uploadFileName}`;

  let uploadData = {
    message: commitMessage,
    content: solution,
    sha,
  };

  uploadData = JSON.stringify(uploadData);

  const xhttp = new XMLHttpRequest();
  xhttp.addEventListener('readystatechange', function () {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200 || xhttp.status === 201) {
        const updatedSha = JSON.parse(xhttp.responseText).content.sha;

        chrome.storage.local.get('userStatistics', (statistics) => {
          let { userStatistics } = statistics;
          if (!userStatistics || Object.keys(userStatistics).length === 0) {

            userStatistics = {};
            userStatistics.solved = 0;
            userStatistics.school = 0;
            userStatistics.basic = 0;
            userStatistics.easy = 0;
            userStatistics.medium = 0;
            userStatistics.hard = 0;
            userStatistics.streak = 0;
            userStatistics.lastSubmitted = null;
            userStatistics.sha = {};

          }
          const githubFilePath = problemTitle + uploadFileName;

          if (uploadFileName === 'README.md') {
            if (sha === null) {
              const diff = problemDifficulty ? problemDifficulty.toLowerCase() : '';
              userStatistics.solved += 1;
              userStatistics.school += diff.includes('school') ? 1 : 0;
              userStatistics.basic += diff.includes('basic') ? 1 : 0;
              userStatistics.easy += diff.includes('easy') ? 1 : 0;
              userStatistics.medium += diff.includes('medium') ? 1 : 0;
              userStatistics.hard += diff.includes('hard') ? 1 : 0;
            }
          } else {
            if (!userStatistics.languages) {
              userStatistics.languages = {};
              for (const fileKey of Object.keys(userStatistics.sha || {})) {
                if (!fileKey.endsWith('.md')) {
                  const fileExt = fileKey.split('.').pop();
                  if (fileExt) {
                    userStatistics.languages[fileExt] = (userStatistics.languages[fileExt] || 0) + 1;
                  }
                }
              }
            }
            const ext = uploadFileName.split('.').pop();
            if (ext) {
              userStatistics.languages[ext] = (userStatistics.languages[ext] || 0) + 1;
            }
          }

          const todayDate = new Date().toISOString().split('T')[0];
          const lastSubmitted = userStatistics.lastSubmitted || null;

          if (lastSubmitted !== todayDate) {
            if (lastSubmitted) {
              const prevDate = new Date(lastSubmitted);
              const currDate = new Date(todayDate);
              const diffTime = Math.abs(currDate - prevDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 1) {
                userStatistics.streak = (userStatistics.streak || 0) + 1;
              } else {
                userStatistics.streak = 1;
              }
            } else {
              userStatistics.streak = 1;
            }
            userStatistics.lastSubmitted = todayDate;
          }
          userStatistics.sha[githubFilePath] = updatedSha;
          chrome.storage.local.set({ userStatistics }, () => {
            console.log(`${uploadFileName} - Commit Successful`,);
          });
        });
      }
    }
  });
  xhttp.open('PUT', uploadPathURL, true);
  xhttp.setRequestHeader('Authorization', `token ${githubAccessToken}`);
  xhttp.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhttp.send(uploadData);
};

function uploadGitHub(
  solution,
  problemName,
  uploadFileName,
  commitMessage,
  problemDifficulty = undefined,
) {
  let difficulty = '';
  if (problemDifficulty && problemDifficulty !== undefined) {
    difficulty = problemDifficulty.trim();
  }

  chrome.storage.local.get('githubAccessToken', (access_token) => {
    const accessToken = access_token.githubAccessToken;
    if (accessToken) {
      chrome.storage.local.get('current_phase', (phase) => {
        const currentPhase = phase.current_phase;
        if (currentPhase === 'solve_and_push') {
          chrome.storage.local.get('github_LinkedRepository', (linkedRepo) => {
            const linkedRepository = linkedRepo.github_LinkedRepository;
            if (linkedRepository) {
              const githubFilePath = problemName + uploadFileName;
              chrome.storage.local.get('userStatistics', (statistics) => {
                const { userStatistics } = statistics;
                let sha = null;

                if (userStatistics !== undefined && userStatistics.sha !== undefined && userStatistics.sha[githubFilePath] !== undefined) {
                  sha = userStatistics.sha[githubFilePath];
                }
                uploadToGitHubRepository(
                  accessToken,
                  linkedRepository,
                  solution,
                  problemName,
                  uploadFileName,
                  sha,
                  commitMessage,
                  difficulty,
                );
              });
            }
          });
        }
      });
    }
  });
}

const convertToKebabCase = (uploadFileName) => {
  return uploadFileName.replace(/[^a-zA-Z0-9\. ]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
};

function getSolutionLanguage() {
  const languageElements = document.getElementsByClassName('divider text');
  if (languageElements && languageElements.length > 0) {
    const langRaw = languageElements[0].innerText;
    if (langRaw) {
      const lang = langRaw.split('(')[0].trim();
      if (lang.length > 0 && codeLanguage[lang]) {
        return codeLanguage[lang];
      }
    }
  }
  return null;
}

function getProblemTitle() {
  const problemTitleElement = document.querySelector('[class^="problems_header_content__title"] > h3');
  if (problemTitleElement != null) {
    return problemTitleElement.innerText || '';
  }
  return '';
}

function getProblemDifficulty() {
  const problemDifficultyNode = document.querySelector('[class^="problems_header_description"]');
  if (problemDifficultyNode && problemDifficultyNode.children.length > 0) {
    return problemDifficultyNode.children[0].innerText || '';
  }
  return '';
}

function getProblemStatement() {
  const problemStatementElement = document.querySelector('[class^="problems_problem_content"]');
  if (problemStatementElement != null) {
    return `${problemStatementElement.outerHTML}`;
  }
  return '';
}

function getCompanyAndTopicTags(problemStatement) {
  let tagHeading = document.querySelectorAll('.problems_tag_container__kWANg');
  let tagContent = document.querySelectorAll(".content");

  if (!tagHeading || !tagContent) return problemStatement;

  for (let i = 0; i < tagHeading.length; i++) {
    if (!tagHeading[i] || !tagContent[i]) continue;

    if (tagHeading[i].innerText === 'Company Tags') {
      tagContent[i].classList.add("active");
      problemStatement = problemStatement.concat("<p><span style=font-size:18px><strong>Company Tags : </strong><br>");

      let childNode = tagContent[i].childNodes[0];
      if (childNode && childNode.children) {
        let numOfTags = childNode.children.length;
        for (let j = 0; j < numOfTags; j++) {
          if (childNode.children[j] && childNode.children[j].innerText !== null) {
            const company = childNode.children[j].innerText;
            problemStatement = problemStatement.concat("<code>" + company + "</code>&nbsp;");
          }
        }
      }
      tagContent[i].classList.remove("active");
    }
    else if (tagHeading[i].innerText === 'Topic Tags') {
      tagContent[i].classList.add("active");
      problemStatement = problemStatement.concat("<br><p><span style=font-size:18px><strong>Topic Tags : </strong><br>");

      let childNode = tagContent[i].childNodes[0];
      if (childNode && childNode.children) {
        let numOfTags = childNode.children.length;
        for (let j = 0; j < numOfTags; j++) {
          if (childNode.children[j] && childNode.children[j].innerText !== null) {
            const company = childNode.children[j].innerText;
            problemStatement = problemStatement.concat("<code>" + company + "</code>&nbsp;");
          }
        }
      }
      tagContent[i].classList.remove("active");
    }
  }
  return problemStatement;
}

const loader = setInterval(() => {
  let problemTitle = null;
  let problemStatement = null;
  let problemDifficulty = null;
  let solutionLanguage = null;
  let solution = null;

  if (window.location.href.includes('www.geeksforgeeks.org/problems',)) {

    const gfgSubmitButton = document.querySelector('[class^="ui button problems_submit_button"]');

    gfgSubmitButton.addEventListener('click', function () {
      document.querySelector('.problems_header_menu__items__BUrou').click();
      successfulSubmissionFlag = true;

      const submissionLoader = setInterval(() => {
        const contentNode = document.querySelector('[class^="problems_content"]');
        const submissionResult = contentNode ? contentNode.innerText : '';
        if (submissionResult.includes('Problem Solved Successfully') && successfulSubmissionFlag) {
          successfulSubmissionFlag = false;
          clearInterval(loader);
          clearInterval(submissionLoader);
          document.querySelector('.problems_header_menu__items__BUrou').click();
          problemTitle = getProblemTitle().trim();
          problemDifficulty = getProblemDifficulty();
          problemStatement = getProblemStatement();
          solutionLanguage = getSolutionLanguage();
          console.log("Initialised Upload Variables");

          chrome.runtime.sendMessage({ type: 'showFireBadge' });

          const probName = `${problemTitle}`;
          var questionUrl = window.location.href;
          problemStatement = `<h2><a href="${questionUrl}">${problemTitle}</a></h2><h3>Difficulty Level : ${problemDifficulty}</h3><hr>${problemStatement}`;
          problemStatement = getCompanyAndTopicTags(problemStatement);

          if (solutionLanguage !== null) {
            chrome.storage.local.get('userStatistics', (statistics) => {
              const { userStatistics } = statistics;
              const githubFilePath = probName + convertToKebabCase(problemTitle + solutionLanguage);
              let sha = null;
              if (
                userStatistics !== undefined &&
                userStatistics.sha !== undefined &&
                userStatistics.sha[githubFilePath] !== undefined
              ) {
                sha = userStatistics.sha[githubFilePath];
              }
              if (sha === null) {
                uploadGitHub(
                  btoa(unescape(encodeURIComponent(problemStatement))),
                  probName,
                  'README.md',
                  "Create README - GfG to GitHub",
                  problemDifficulty,
                );
              }

              chrome.runtime.sendMessage({ type: 'getUserSolution' }, function (res) {

                console.log("getUserSolution - Message Sent.");
                setTimeout(function () {
                  solution = document.getElementById('extractedUserSolution').innerText;
                  if (solution !== '') {
                    setTimeout(function () {
                      if (sha === null) {
                        uploadGitHub(
                          btoa(unescape(encodeURIComponent(solution))),
                          probName,
                          convertToKebabCase(problemTitle + solutionLanguage),
                          "Added Solution - GfG to GitHub",
                          problemDifficulty,
                        );
                      }
                      else {
                        uploadGitHub(
                          btoa(unescape(encodeURIComponent(solution))),
                          probName,
                          convertToKebabCase(problemTitle + solutionLanguage),
                          "Updated Solution - GfG to GitHub",
                          problemDifficulty,
                        );
                      }
                    }, 1000);
                  }
                  chrome.runtime.sendMessage({ type: 'deleteNode' }, function () {
                    console.log("deleteNode - Message Sent.");
                  });
                }, 1000);
              });
            });
          }
        }

        else if (submissionResult.includes('Compilation Error')) {
          clearInterval(submissionLoader);
        }

        else if (!successfulSubmissionFlag && (submissionResult.includes('Compilation Error') || submissionResult.includes('Correct Answer'))) {
          clearInterval(submissionLoader);
        }
      }, 1000);
    });
  }
}, 1000);