let messages=(message)=>
{
    let messagecont=document.getElementById("message");
    messagecont.innerText=message;
    
    setTimeout(()=>
    {
        messagecont.innerText="";
    },3000);
}