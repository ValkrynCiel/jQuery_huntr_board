$(function() {

  let $editForm = $('#edit-form');
  let $editName = $('#edit-name');
  let $editColor = $('#edit-color');
  let $editSave = $('#edit-save');
  let $editJobId = $('#edit-job-id');

  let jobs = localStorage.getItem('jobs') ? JSON.parse(localStorage.getItem('jobs'))
    : {
    1: { name: 'google', color: 'green' }, 
    2: { name: 'facebook', color: 'blue' }, 
    3: { name: 'microsoft', color: 'red' }, 
    4: { name: 'walmart', color: 'yellow' }, 
    5: { name: 'betterhelp', color: 'orange'}
  }

  let columns = localStorage.getItem('columns') ? JSON.parse(localStorage.getItem('columns')) : {
    applied: [1, 3, 5],
    interview: [4],
    offer: [2]
  }

  $(".sortable").sortable({
    placeholder: 'placeholder',
    connectWith: ".sortable",
    scroll: true,
    receive: function (e , ui) {
      let receiverId = $(this).attr('id');

      columns[receiverId] = $(`#${receiverId}`).sortable('toArray');
    },
    stop: function (e, ui) {
      let stopId = $(this).attr('id');
      columns[stopId] = $(`#${stopId}`).sortable('toArray');
      
      localStorage.setItem('columns', JSON.stringify(columns));
    }
  });

  function displayJobOrder() {
    for (let column in columns) {

      let order = columns[column];

      for (let id of order) {
        let job = jobs[id];

        $(`<div></div>`, {
            id,
            'class': "job-post",
            data: { info: job },
            css: { 'background-color': job.color }
          }
        ).appendTo($(`#${column}`));
    
        $(`#${id}`).append(`<span>${job.name}</span>`)
      }; 
    };
  }

  displayJobOrder();

  $('body').on('click', '.job-post', function(e) {

    $editJobId.val($(this).attr('id'));
    $editName.val($(this).data('info').name);
    $editColor.val($(this).data('info').color);

    $editForm.modal({
      clickClose: false
    });
  });

  $('body').on('click', '.add-job-button', function(e) {
    let sortableId = $(this)
      .closest('.list-container')
      .children('.sortable')[0].id;

    let text = 'clicked';
    let jobId = Date.now();

    $(`<div></div>`, {
      id: jobId,
      'class': "job-post",
      data: { info: {name: 'clicked', color: 'brown'} },
      css: { 'background-color': 'brown' }

    }).appendTo($(`#${sortableId}`));

  $(`#${jobId}`).append(`<span>${text}</span>`)
  });

  $editSave.click(function(e) {
    e.preventDefault();

    let newColor = $editColor.val();
    let newName = $editName.val();
    let id = $editJobId.val();

    let $postToUpdate = $(`#${id}`)

    let data = $postToUpdate.data('info');
    data.color = newColor;
    data.name = newName;

    jobs[id] = data;

    $postToUpdate
      .css({
        'background-color': newColor
      })
      .data('info', data)
      .children('span').eq(0).html(newName);

      localStorage.setItem('jobs', JSON.stringify(jobs));

  });
    
});