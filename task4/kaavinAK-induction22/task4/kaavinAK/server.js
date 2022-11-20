let express = require('express')
let tf = require('@tensorflow/tfjs');
let tfn = require("@tensorflow/tfjs-node")
let papa = require('papaparse');
let path = require('path');
let fs = require('fs')
//let vis = require('@tensorflow/tfjs-vis');
//5.1,3.5,1.4,0.2
let app = express();

app.set('view engine','ejs');
app.use(express.json());
papa.main=(file)=>
{
    return new Promise((complete,error)=>
    {
        
        papa.parse(fs.createReadStream(file),{
            header:true,
            delimiter:",",
           
            dynamicTyping:true,
            complete,
            error
         
        });
    })
}
app.use(express.static(path.join(__dirname,'public')))

const oneHot = outcome => Array.from(tf.oneHot(outcome, 3).dataSync())
const createDataSets = (data, features, testSize, batchSize) => {
    const X = data.map(r =>
        features.map(f => {
          const val = r[f]
          return val === undefined ? 0 : val
        })
      )
      const y = data.map(r => {
        const outcome = r.Outcome === undefined ? 0 : r.Outcome
        return oneHot(outcome)
      })
      const ds = tf.data
  .zip({ xs: tf.data.array(X), ys: tf.data.array(y) })
  .shuffle(data.length, 42)
  const splitIdx = parseInt((1 - testSize) * data.length, 10)
return [
  ds.take(splitIdx).batch(batchSize),
  ds.skip(splitIdx + 1).batch(batchSize),
  tf.tensor(X.slice(splitIdx)),
  tf.tensor(y.slice(splitIdx)),
]
  };

  let trainmodels=async(featureCount,trainDs,validDs)=>
  {
    const model = tf.sequential()
    model.add(
      tf.layers.dense({
        units: 3,
        activation: "softmax",
        inputShape: [featureCount],
      })
    )
    const optimizer = tf.train.adam(0.001)
model.compile({
  optimizer: optimizer,
  loss: "categoricalCrossentropy",
  metrics: ["accuracy"],
})
//console.log("untrined ",model)
await model.fitDataset(trainDs, {
    epochs: 70,
    validationData: validDs
    
  })
 // console.log("trained ",model);
  return model;
  }
  
let logisticRegression=async(data)=>
{
    const features = ["sepal_length","sepal_width","petal_length","petal_width"]
const [trainDs, validDs, xTest, yTest] = createDataSets(data, features, 0.1, 16)
//console.log("train ds ",trainDs);
let model=await trainmodels(features.length, trainDs, validDs)
// let result=(await model).predict(tf.tensor([5.1,3.5,1.4,0.2]).reshape([-1, 4])).dataSync();
//console.log("unloaded result ----  ",result);

return model;
//console.log(model)

}




app.get('/', async(req,res)=>
{

       
       res.render('indes.ejs');
})
app.post('/savemodel',async(req,res)=>
{

    let token=req.body['token'];
console.log(token);
let model;
let handler;
try{
     handler =  tfn.io.fileSystem("./files/"+token+".json/model.json");
     model = await tf.loadLayersModel(handler);
    
}
catch(e)
{

}
    console.log("modellll    ",model)
    if(model!=null)
    {
       // let result=(await model).predict(tf.tensor([5.1,3.5,1.4,0.2]).reshape([-1, 4])).dataSync();
      //  console.log("loaded ",result)
           return res.json({status:"success"});
    }
       let loaddata=await papa.main('iris.csv');
      loaddata=loaddata.data;
     
       loaddata.forEach((data)=>
       {
              if(data['species']=='setosa')
              {
                  data['Outcome']=0;
              }
              else if(data['species']=='versicolor')
              {
                  data['Outcome']=1;
              }
              else if(data['species']=='virginica')
              {
                  data['Outcome']=2;
              }
       })
    model=  await  logisticRegression(loaddata);
  //  let result=(await model).predict(tf.tensor([5.1,3.5,1.4,0.2]).reshape([-1, 4])).dataSync();
    // const saveResult = await model.save('localstorage://my-model-1');
     handler = tfn.io.fileSystem("./files/"+token+".json");
    await model.save(handler);
   console.log("bruhhh")
    return res.json({status:"success"}) 
   
})
app.post('/predict',async(req,res)=>
{
    let token=req.body['token'];
    let {sepallengthpredict,sepalwidthpredict,petallengthpredict,petalwidthpredict}=req.body;
console.log(sepalwidthpredict,sepallengthpredict)
    console.log(token);
    let model;
    let handler;
    try{
         handler = tfn.io.fileSystem("./files/"+token+".json/model.json");
         model = await tf.loadLayersModel(handler);
         if(model==null)
         {
             return res.json({status:"failed"})
         }
         else
         {
             let result=(await model).predict(tf.tensor([parseInt(sepallengthpredict),parseInt(sepalwidthpredict),parseInt(petallengthpredict),parseInt(petalwidthpredict)]).reshape([-1, 4])).dataSync();
    console.log(sepallengthpredict,result)
    result=[...result]
    let index=0;
 let max=-10000;

 result.forEach((obj,i)=>
 {
     if(obj>max)
     {
         index=i;
         max=obj
     }
 })
 if(index==0)
 {
     result='setosa'
 }
 else if(index==1)
 {
     result='versicolor'
 }
 else if(index==2)
 {
     result='virginica'
 }
             return res.json({status:"success",result:result})
         }
    }
    catch(e)
    {
        console.log(e);
    return res.json({status:"caught"})
    }
    
       
})
app.post('/retrainmodel',async(req,res)=>
{
    let {token}=req.body;
    let loaddata=await papa.main('iris.csv');
    loaddata=loaddata.data;
   
     loaddata.forEach((data)=>
     {
            if(data['species']=='setosa')
            {
                data['Outcome']=0;
            }
            else if(data['species']=='versicolor')
            {
                data['Outcome']=1;
            }
            else if(data['species']=='virginica')
            {
                data['Outcome']=2;
            }
     })
  model=  await  logisticRegression(loaddata);
//  let result=(await model).predict(tf.tensor([5.1,3.5,1.4,0.2]).reshape([-1, 4])).dataSync();
  // const saveResult = await model.save('localstorage://my-model-1');
   handler = tfn.io.fileSystem("./files/"+token+".json");
  await model.save(handler);
 console.log("bruhhh")
  return res.json({status:"success"}) 
})
app.post("/adddata",async(req,res)=>

{
    let token=req.body['token'];
    let {sepalwidth,sepallength,petallength,petalwidth,species}=req.body;
    let loaddata=await papa.main('iris.csv');
    loaddata=loaddata.data;
   let model;
   console.log(loaddata);
   
   loaddata.push({
       sepal_length:parseInt(sepallength),
       sepal_width:parseInt(sepalwidth),
       petal_length:parseInt(petallength),
       petal_width:parseInt(petalwidth),
       species:species
   })
     loaddata.forEach((data)=>
     {
            if(data['species']=='setosa')
            {
                data['Outcome']=0;
            }
            else if(data['species']=='versicolor')
            {
                data['Outcome']=1;
            }
            else if(data['species']=='virginica')
            {
                data['Outcome']=2;
            }
     })
  model=  await  logisticRegression(loaddata);
  //let result=(await model).predict(tf.tensor([5.1,3.5,1.4,0.2]).reshape([-1, 4])).dataSync();
  // const saveResult = await model.save('localstorage://my-model-1');
   handler = tfn.io.fileSystem("./files/"+token+".json");
  await model.save(handler);
 console.log("bruhhh")
  return res.json({status:"success"}) 
 //   return res.json({status:"success"})
})
app.listen(5000,()=>
{
    console.log("server started ...... ");
})
