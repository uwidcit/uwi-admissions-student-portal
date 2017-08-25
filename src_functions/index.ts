import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
const database = admin.database();
const INGORED_COURSES = ['CSEC_Mathematics', 'CSEC_English Language'];

import { Programme } from './models/programme'

function getSubjectsOfType(subjects: string[], type: string){
  return subjects.filter(subject => subject.indexOf(type) !== -1).map(subject => subject.substr(5));
}

function meetsMandatory(subjects: string[], programme: Programme, type: string){
  return programme[`${type}Mandatory`].split(',').map(subject => subject.trim())
    .reduce((currentVal, subject) => currentVal && subjects.indexOf(subject) !== -1, true);
}

function meetsAnyNumberOf(subjects: string[], programme: Programme, type: string, num: number){
  let subjectsOfAnyNumberOf = programme[`${type}Any${num}of`];
  if(subjectsOfAnyNumberOf === "") return true;
  return subjectsOfAnyNumberOf.split(',').map(subject => subject.trim())
    .reduce((count, subject) => count + subjects.indexOf(subject) === -1 ? 0 : 1, 0) >= num;
}

exports.getProgrammes = functions.https.onRequest((request, response) => {
  if(!request.query.subjects) {
    response.json([]);
    return;
  }
  
  console.log('Subjects:', request.query.subjects);
  let subjects = request.query.subjects.split(',').map(subject => subject.trim()).filter(subject => !!subject);
  let csecSubjects = getSubjectsOfType(subjects, 'CSEC'), capeSubjects = getSubjectsOfType(subjects, 'CAPE');
  let searchRef = database.ref('/search');

  let results = new Map(), resultsCount = 0;
  return new Promise<Programme[]>((resolve, reject) => {
    for(let subject of subjects){
      if(INGORED_COURSES.indexOf(subject) !== -1) resultsCount++;
      else searchRef.child(subject).once('value', snapshot => {
        let programmes = snapshot.val();
        resultsCount++;
        if(programmes !== null)
          for(let key in programmes) {
            results.set(key, programmes[key]);
          }
  
        if(resultsCount === subjects.length) {
          resolve(Array.from(results.values()));
        }
      });
    }
  })
  //Extract the programmes that the subjects specified qualify a student for
  .then(programmes => {
    return programmes.filter(programme => {
      return programme.CSECPasses <= csecSubjects.length
      &&   meetsMandatory(csecSubjects, programme, 'CSEC') 
      &&   meetsAnyNumberOf(csecSubjects, programme, 'CSEC', 1) 
      &&   meetsAnyNumberOf(csecSubjects, programme, 'CSEC', 2) 
      &&   meetsAnyNumberOf(csecSubjects, programme, 'CSEC', 3) 
      &&   meetsAnyNumberOf(csecSubjects, programme, 'CSEC', 4) 
      &&   meetsAnyNumberOf(csecSubjects, programme, 'CSEC', 5)
      &&   programme.CAPEPasses <= capeSubjects.length
      &&     meetsMandatory(capeSubjects, programme, 'CAPE') 
      &&   meetsAnyNumberOf(capeSubjects, programme, 'CAPE', 1) 
      &&   meetsAnyNumberOf(capeSubjects, programme, 'CAPE', 2) 
      &&   meetsAnyNumberOf(capeSubjects, programme, 'CAPE', 3) 
      &&   meetsAnyNumberOf(capeSubjects, programme, 'CAPE', 4) 
      &&   meetsAnyNumberOf(capeSubjects, programme, 'CAPE', 5);
    });
  })
  //Cache on client for a day, Cache on server for a week
  .then(programmes => response.set('Cache-Control', 'public, max-age=86400, s-maxage=604800').send(programmes));
});