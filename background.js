chrome.contextMenus.removeAll();

const domain = "http://resumeforsloths.info"
const frontend = `${domain}:8501`
const backend = `${domain}:8502`

chrome.contextMenus.create({
    id: "edit_profile",
    title: "Edit Profile",
    contexts: ["action"],
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "edit_profile") {
        chrome.tabs.create({
            url: frontend
        })
    }
});


function extract_JD(){
    const url =  window.location.href

    if (url.includes('linkedin'))
    {return document.getElementById("job-details").innerText}

    else{
        let list = []
        let x = document.getElementsByTagName('*');
        for (let i = 0, c = x.length ; i < c ; i++) {
            list[i] = x[i].toString()
        }
        return list
    }
}

chrome.action.onClicked.addListener(async (tab) => {

    console.log(tab.id)

    // Cookie Business
    const cookie_name = 'userdetails'
    const userdetails = await chrome.cookies.get({"url": domain, "name": cookie_name}).then((res) => decodeURIComponent(res.value));
    let [user, name] = userdetails.split(',')
    name = name.replaceAll(' ', '')

    // Extract Job Description from LinkedIn (Expand to include other and possibly find divs)
    const jobDescription = await chrome.scripting.executeScript({target: {tabId: tab.id},
        func: extract_JD,
    }).then((res) => res[0].result)


    // POST Request thingies which includes information that is sent to backend
    const SaveJobPackage = {
		method: 'POST',
		headers: {'Content-Type': 'application/json; charset=UTF-8'},
		body: JSON.stringify({user: user, jobDescription: jobDescription})
	};

    const RunScriptPackage = {
		method: 'POST',
		headers: {'Content-Type': 'application/json; charset=UTF-8'},
		body: JSON.stringify({user: user})
	};

    // The three magic commands ❤️
    await fetch(backend+"/save-job-description", SaveJobPackage).then((r)=>r.text()).then((r)=>console.log(r))
    // chrome.scripting.executeScript({target: {tabId: tab.id}, func: ()=>{alert('Generating Resume')}}).then((res) => res[0].result)
    chrome.notifications.create("resfs_updates", {
        title: "ResFS",
        message: "Generating Resume",
        iconUrl: 'icon.png',
        type: 'basic'
    })

    // chrome.notifications.create("experimental", {
    //     title: "Something",
    //     message: "Generating Resume",
    //     iconUrl: 'icon.png',
    //     progress: 10,
    //     type: 'progress'
    // })

    let result = await fetch(backend+"/run-python-script", RunScriptPackage).then((res) => res.text())

    if (result == "Success"){
        // await chrome.scripting.executeScript({target: {tabId: tab.id}, func: ()=>{alert('Resume Successfully Generated')}})
        chrome.notifications.create("resfs_updates", {
            title: "ResFS",
            message: "Resume Successfully Generated",
            iconUrl: 'icon.png',
            type: 'basic'
        })
        await chrome.tabs.create({url: `${backend}/download-resume?user=${user}&name=${name}`.toString()})
    }
    else{
        chrome.notifications.create("resfs_updates", {
            title: "ResFS",
            message: "Resume Generation Failed",
            iconUrl: 'icon.png',
            type: 'basic'
        })
    }
})