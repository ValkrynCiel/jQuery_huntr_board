$(function() {


  let $editForm = $('#edit-form');
  let $editName = $('#edit-name');
  let $editColor = $('#edit-color');
  let $editSave = $('#edit-save');
  let $editJobId = $('#edit-job-id');

  let jobs = localStorage.getItem('jobs') ? 
  JSON.parse(localStorage.getItem('jobs')) : {}

  let columns = localStorage.getItem('columns') ? 
  JSON.parse(localStorage.getItem('columns')) : {
    applied: [],
    interview: [],
    offer: []
  }

  $(".sortable").sortable({
    placeholder: 'placeholder',
    connectWith: ".sortable",
    opacity: 0.8,
    start: function (e, ui) {
      ui.item.children('.icon').eq(0).toggleClass('is-dragging');
      console.log(ui.item.children('.icon').eq(0).hasClass('is-dragging'));
    },
    over: function(e,ui) {
      if (ui.sender) {
        let widget = ui.sender.data("ui-sortable");
        widget.scrollParent = $(this);
        widget.overflowOffset = $(this).offset();
      }
    },
    receive: function (e , ui) {
      let receiverId = $(this).attr('id');

      columns[receiverId] = $(`#${receiverId}`).sortable('toArray');
    },
    stop: function (e, ui) {
      let stopId = $(this).attr('id');
      columns[stopId] = $(`#${stopId}`).sortable('toArray');
      
      localStorage.setItem('columns', JSON.stringify(columns));
      ui.item.children('.icon').eq(0).toggleClass('is-dragging')
    }
  });

  function displayColumns() {
    for (let key in columns) {

      let $column = $($('#column-template').html());

      $column.find('.title').html(key.toUpperCase());
      $column.find('.sortable').attr('id', key);
      $('body').append($column);
      
      displayJobOrder(key);

    }
  }

  displayColumns();

  function displayJobOrder(column) {
    let order = columns[column];
    
    for (let id of order) {

      let jobInfo = jobs[id];
      let $jobPost = $($('#job-post-template').html());

      $jobPost
        .attr('id', id)
        .css({ 'background-color': jobInfo.color })
        .data({ info: jobInfo })
        .find('.company-name').html(jobInfo.name);

      $(`#${column}`).append($jobPost);
    }; 
  }

  $('body').on('click', '.job-post', function(e) {

    $editJobId.val($(this).attr('id'));
    $editName.val($(this).data('info').name);
    $editColor.val($(this).data('info').color);

    $editForm.modal({
      clickClose: false
    });
  });

  $('body').on('click', '.icon', function(e) {
    e.stopPropagation();
    let $sortable = $(this)
      .closest('.sortable')[0];
    let $job = $(this)
      .closest('.job-post')[0];

    $(`#${$job.id}`).remove();
    delete jobs[$job.id];
    $('.sortable').sortable('refresh');

    columns[$sortable.id] = $(`#${$sortable.id}`).sortable('toArray');
    localStorage.setItem('columns', JSON.stringify(columns));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
  });
    

  $('body').on('click', '.add-job-button', function(e) {
    let sortableId = $(this)
      .closest('.list-container')
      .children('.sortable')[0].id;

    let jobId = Date.now();
    let color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
    let name = 'clicked';
    let info = { name, color }
    

    $(`<div></div>`, {
      id: jobId,
      'class': "job-post",
      data: { info },
      css: { 'background-color': color }

    }).appendTo($(`#${sortableId}`));

    $('.sortable').sortable('refresh');

    let $title = $(`<span>clicked</span>`);

    let $trashIcon = 
    $(`<div class="icon">
          <i class="fa fa-trash" aria-hidden="true"></i>
      <div/>`);

    $(`#${jobId}`).append($title, $trashIcon);

    jobs[jobId] = info
    columns[sortableId] = $(`#${sortableId}`).sortable('toArray');
    localStorage.setItem('columns', JSON.stringify(columns));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
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