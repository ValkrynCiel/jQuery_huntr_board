$(function() {

  let $deleteNotice = $('#delete-job-notice');
  let $deleteColumnId = $('#delete-column-id');
  let $deleteJobId = $('#delete-job-id');
  let $deleteButton = $('#delete-button');
  let $nevermindButton = $('#nevermind-button');

  let $addForm = $('#add-form');
  let $addName = $('#add-name');
  let $addSave = $('#add-save');
  let $addColumnId = $('#add-column-id');

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

  function displayColumns() {
    for (let key in columns) {

      let $column = $($('#column-template').html());

      $column
        .find('.title')
          .html(key.toUpperCase());

      $column
        .find('.sortable')
          .attr('id', key);

      $('body').append($column);

      displayJobOrder(key);

    }
  }

  displayColumns();

  function displayJobOrder(column) {
    let order = columns[column];
    
    for (let id of order) {

      let jobInfo = jobs[id];
      let $jobPost = createJobPost(id, jobInfo);

      $(`#${column}`).append($jobPost);
    }; 
  }

  function createJobPost(id, info) {
    let $jobPost = $($('#job-post-template').html())

    $jobPost
      .attr('id', id)
      .css({ 'background-color': info.color })
      .data({ info })
      .find('.company-name')
        .html(info.name);
 
    return $jobPost
  }

  $(".sortable").sortable({
    placeholder: 'placeholder',
    connectWith: ".sortable",
    opacity: 0.8,
    start: function (e, ui) {
      ui.item.children('.icon-container').eq(0).toggleClass('is-dragging');
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
      ui.item.children('.icon-container').eq(0).toggleClass('is-dragging')
    }
  });

  $('body').on('click', '.job-post', function(e) {

    $editJobId
      .val($(this).attr('id'));
    $editName
      .val($(this).data('info').name);
    $editColor
      .val($(this).data('info').color);

    $editForm.modal({
      clickClose: false
    });
  });

  $('body').on('click', '.icon.trash', function(e) {
    e.stopPropagation();
    $deleteNotice.modal({
      escapeClose: false,
      clickClose: false,
      showClose: false
    });
    let sortableId = $(this)
      .closest('.sortable')
        .eq(0)
        .attr('id');

    let jobId = $(this)
      .closest('.job-post')
        .eq(0)
        .attr('id');

    $deleteColumnId.val(sortableId);
    $deleteJobId.val(jobId);
  });

  $deleteButton.click(function (e) {
    e.preventDefault();
    let $job = $(`#${$deleteJobId.val()}`);
    let sortableId = $deleteColumnId.val();

    $job.remove();
    delete jobs[$job.attr('id')];

    columns[sortableId] = $(`#${sortableId}`).sortable('toArray');
    localStorage.setItem('columns', JSON.stringify(columns));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    $.modal.close();
  });

  $nevermindButton.click(function (e) {
    e.preventDefault();
    $.modal.close();
  });
    
  $('body').on('click', '.add-job-button', function(e) {
    let sortableId = $(this)
      .closest('.list-container')
      .children('.sortable')
        .eq(0).attr('id');

    $addColumnId.val(sortableId);

    $addForm.modal({
      clickClose: false
    });
    
  });

  $('body').on('mouseenter', '.icon', function (e) {
    let color = $(this).closest('.job-post').css('background-color');
    $(this).css({
      color: color
    })
  });

  $('body').on('mouseleave', '.icon', function (e) {
    $(this).css({
      color: 'white'
    });
  })

  $addSave.click(function(e) {

    e.preventDefault();

    let sortableId = $addColumnId.val();

    let jobId = Date.now();
    let color = `rgb(${Math.floor(Math.random()*255)},
                     ${Math.floor(Math.random()*255)},
                     ${Math.floor(Math.random()*255)})`;
    let name = $addName.val();
    if (!name) return;
    let info = { name, color }
    
    let $jobPost = createJobPost(jobId, info);
    $(`#${sortableId}`).append($jobPost);

    jobs[jobId] = info
    columns[sortableId] = $(`#${sortableId}`).sortable('toArray');
    localStorage.setItem('columns', JSON.stringify(columns));
    localStorage.setItem('jobs', JSON.stringify(jobs));

    $('input').val('');

    $.modal.close();

  });

  $editSave.click(function(e) {
    e.preventDefault();

    let color = $editColor.val();
    let name = $editName.val();
    let id = $editJobId.val();

    let info = { color, name }
    jobs[id] = info;

    let $newJobPost = createJobPost(id, info);
    $(`#${id}`).replaceWith($newJobPost);

    localStorage.setItem('jobs', JSON.stringify(jobs));

    $.modal.close();
  });
    
});