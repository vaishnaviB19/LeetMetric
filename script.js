document.addEventListener("DOMContentLoaded",function(){


    const searchButton=document.getElementById("search-btn");
    const usernameInput=document.getElementById("user-input");
    const statsContainer=document.querySelector(".stat-container");
    const easyProgressCircle=document.querySelector(".easy-progress");
    const mediumProgressCircle=document.querySelector(".medium-progress");
    const hardProgressCircle=document.querySelector(".hard-progress");
    const easyLabel=document.querySelector("#easy-label");
    const mediumLabel=document.querySelector("#medium-label");
    const hardLabel=document.querySelector("#hard-label");
    const cardStatsContainer=document.querySelector(".stats-cards");
    function validateUsername(username){
        if(username.trim()===''){
            alert("username should not be empty");
            return false;
        }
        const regex = /^[A-Za-z0-9_-]+$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }
    async function fetchUserDetails(username){
         
         try{
            searchButton.textContent="searching...";
            searchButton.disabled=true;
            cardStatsContainer.style.visibility = "hidden";

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
            const targetUrl=`https://leetcode.com/graphql/`;
            const myHeaders=new Headers();
             myHeaders.append("content-type","application/json");
               const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
             })
            const requestOptions = {
                method:"post",
                headers:myHeaders,
                body: graphql,
                redirect: "follow"
            };
            const response= await fetch(proxyUrl+targetUrl,requestOptions);
            if(!response.ok){
               throw new Error("Unable to fetch user details!");
            }
            const parsedData=await response.json();
            cardStatsContainer.style.visibility = "visible";
            // console.log("Logging data",parsedData);
            displayUserData(parsedData);
         }
         catch(error){
             statsContainer.innerHTML = '<p>No data found!</p>';
         }
         finally{
            searchButton.textContent="search";
            searchButton.disabled=false;
         }
    }
    function updateProgress(solved, total, label, circle){
       const progressDegree=(solved/total)*100;
       circle.style.setProperty("--progress-degree",`${progressDegree}%`);
       label.textContent=`${solved}/${total}`;
    }
    function displayUserData(parsedData){
         const totalQues=parsedData.data.allQuestionsCount[0].count;
         const totalEasyQues=parsedData.data.allQuestionsCount[1].count;
         const totalMediumQues=parsedData.data.allQuestionsCount[2].count;
         const totalHardQues=parsedData.data.allQuestionsCount[3].count;

         const solvedTotalQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
         const solvedTotalEasyQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
         const solvedTotalMediumQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
         const solvedTotalHardQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;
        
         updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
         updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
         updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

         const cardsData=[
            {label: "overall submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label: "overall easy submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label: "overall medium submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label: "overall hard submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
         ]
         console.log(cardsData);
         cardStatsContainer.innerHTML=cardsData.map(
            data=>{
                return `
                <div class="card">
                <h4>${data.label}</h4 >
                <p>${data.value}</p>
                </div>
                `;
            })
            .join("");
    }
    searchButton.addEventListener('click',function(){
         const username=usernameInput.value;
         console.log("logging username: ",username);
         if(validateUsername(username)){
            fetchUserDetails(username);
         }
    });
});