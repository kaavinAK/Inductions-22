let dropdownbtn = document.getElementById('dropdownbtn');

let setosabutton=document.createElement('button')
setosabutton.innerHTML="setosa"
let virginicabutton=document.createElement('button')
virginicabutton.innerHTML="virginica"
let versicolorbutton=document.createElement('button')
versicolorbutton.innerHTML="versicolor"
let species;
let speciesbox=document.getElementById("species");

versicolorbutton.addEventListener('click',()=>
{
species="versicolor"
speciesbox.value='versicolor'
})
virginicabutton.addEventListener('click',()=>
{
species="virginica"
speciesbox.value='virginica'
})
setosabutton.addEventListener('click',()=>
{
species="setosa"
speciesbox.value='setosa'
})
console.log("species----- ",species);
dropdownbtn.appendChild(versicolorbutton)
dropdownbtn.appendChild(virginicabutton)
dropdownbtn.appendChild(setosabutton)