let savemodelbutton = document.getElementById("savemodelbutton");
let predictedarea=document.getElementById("predictarea");
let predictbutton=document.getElementById("predictbutton");
let adddatabutton=document.getElementById("adddatabutton");
let retrainmodel=document.getElementById("retrainmodel")
let predictedresult=document.getElementById("predictedresult");
let ismodelsaved=false;

retrainmodel.addEventListener('click',async()=>
{
    messages("model is getting retrained and saved ")
    await axios.post('http://localhost:5000/retrainmodel',{token:localStorage.getItem('token')})
})
savemodelbutton.addEventListener('click',async()=>
{
   
    messages("model is getting saved")
    ismodelsaved=true;
  await axios.post('http://localhost:5000/savemodel',{token:localStorage.getItem('token')});

})
predictbutton.addEventListener('click',async()=>
{
    if(!ismodelsaved)
    {
        messages("please save the model first")
        return ;
    }
    let sepallengthpredict=document.getElementById("sepallengthpredict").value;
    let sepalwidthpredict=document.getElementById("sepalwidthpredict").value;
    let petallengthpredict=document.getElementById("petallengthpredict").value;
    let petalwidthpredict=document.getElementById("petalwidthpredict").value;
messages("model is getting predicted ")
 let {data}=   await axios.post("http://localhost:5000/predict",{token:localStorage.getItem('token'),sepallengthpredict,sepalwidthpredict,petallengthpredict,petalwidthpredict})
 
 
 predictedresult.innerText="Predicted: "+data['result'];
 

})
adddatabutton.addEventListener('click',async()=>
{
    let sepallength=document.getElementById("sepallength").value;
    let sepalwidth=document.getElementById("sepalwidth").value;
    let petallength=document.getElementById("petallength").value;
    let petalwidth=document.getElementById("petalwidth").value;
    messages("data is getting added and model is saved ")
    console.log(species);
    let {data}=await axios.post("http://localhost:5000/adddata",{token:localStorage.getItem("token"),sepallength,sepalwidth,petallength,petalwidth,species})
})


