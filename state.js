let { listOrder, lists, jobs } = _loadFromLocalStorage();

/** selectively save information to local storage based on updates */
function _saveToLocalStorage ({ jobs, lists, listOrder }) {

  if (jobs) {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }

  if (lists) {
    localStorage.setItem('lists', JSON.stringify(lists));
  }

  if (listOrder) {
    localStorage.setItem('listOrder', JSON.stringify(listOrder));
  }
}

/** load from local storage or initialize data */
function _loadFromLocalStorage () {
  let savedListOrder = localStorage.getItem('listOrder');
  let listOrder = savedListOrder ? JSON.parse(savedListOrder) :
  [1, 2, 3, 4, 5]

  let savedJobs = localStorage.getItem('jobs');
  let jobs = savedJobs ? JSON.parse(savedJobs) : {};

  let savedLists = localStorage.getItem('lists');
  let lists = savedLists ? JSON.parse(savedLists) : 
  {
  1: {title: 'applied', order:[]},
  2: {title: 'phone screen', order:[]},
  3: {title: 'onsite', order:[]},
  4: {title: 'offer', order:[]},
  5: {title: 'rejected', order:[]}
  };

  _saveToLocalStorage({ listOrder, lists, jobs });
  return { listOrder, lists, jobs };
}

function saveJobInfo (jobId, jobInfo) {
  // add a job
  if (!jobs[jobId]) {

    jobs[jobId] = jobInfo;

  } else {
  //edit a job
    for (let key in jobInfo) {
      jobs[jobId][key] = jobInfo[key];
    }
  }
  _saveToLocalStorage({ jobs });
}

function deleteJob (jobId, listId) {
  delete jobs[jobId];
  lists[listId].order = lists[listId].order.filter( id => id !== jobId );
  _saveToLocalStorage({ jobs, lists });
}

function saveListInfo (listId, listInfo) {
  //add a list
  if (!lists[listId]) {

    lists[listId] = listInfo;

  } else {
    //edit a list
    for (let key in listInfo) {
      lists[listId][key] = listInfo[key];
    }
  }
  _saveToLocalStorage({ lists });
}

function deleteListInfo (listId) {
  delete lists[listId];
  listOrder = listOrder.filter( id => id !== listId );
  _saveToLocalStorage({ lists, listOrder });
}

function saveListOrder (listArr) {
  if (listArr) listOrder = listArr;
  _saveToLocalStorage({ listOrder });
}

