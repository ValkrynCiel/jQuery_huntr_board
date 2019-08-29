let { listOrder, lists, jobs } = loadFromLocalStorage();

/** selectively save information to local storage based on updates */
function saveToLocalStorage ({ jobs, lists, listOrder }) {

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

function loadFromLocalStorage () {
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

  return { listOrder, lists, jobs };
}

