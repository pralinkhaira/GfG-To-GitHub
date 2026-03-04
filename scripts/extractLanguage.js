const getLangScript = `
  try {
    var editorMode = ace.edit("ace-editor").session.getMode().$id || '';
    var modeName = editorMode.split('/').pop();
    var langElement = document.createElement("span");
    langElement.innerText = modeName;
    langElement.setAttribute("id", "extractedLanguageMode");
    langElement.setAttribute("style", "display:none");
    document.body.appendChild(langElement);
  } catch(e) {
    console.log("GfG-To-GitHub: Could not extract language mode", e);
  }
  `;

var extractLangScript = document.createElement('script');
extractLangScript.id = 'extractLangScript';
extractLangScript.appendChild(document.createTextNode(getLangScript));

(document.body || document.head || document.documentElement).appendChild(extractLangScript);
