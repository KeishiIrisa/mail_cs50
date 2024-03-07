document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

let currentMailbox = "inbox";

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mail_detail(email_id, mailbox_type) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'block';

  // show email detail
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    // convert into html style
    document.querySelector('#email-detail-view').innerHTML = `<nav class="navbar navbar-light bg-light"><svg id="nav-back" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
  </svg></nav><h2>${email.subject}</h2><div>${email.body}</div><button type="button" id="archive-button" class="btn btn-primary">Archive</button>`
    document.querySelector('#nav-back').addEventListener('click', function(event) {
      const svgElement = event.target.closest('svg');
      if (svgElement) {
        load_mailbox(`${mailbox_type}`);
      }
    })

    document.querySelector('#archive-button').addEventListener('click', function(event) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      .then(response => response.json())
      .then(response => {
        console.log(response);
      })
    })
  })
}

function load_mailbox(mailbox) {

  currentMailbox = mailbox;
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  email_inbox(mailbox);
}

function send_mail() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(response => {
    console.log(response);
  })

  return false;
}

function email_inbox(mailbox) {
  const MAILBOX_LISTS = ["inbox", "sent", "archive"];

  if (MAILBOX_LISTS.includes(mailbox)) {
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(response => {
      console.log(response);
      let listItems = response.map(element=> `<li data-email-id=${element.id} class="list-group-item"><div style="display: flex; justify-content: space-between;"><div style="display: flex; align-items: center;"><h3 style="margin-right: 10px; font-size: 20px;">${element.sender}</h3> ${element.subject}</div>${element.timestamp}</div></li>`).join("");
      let list = `<ul id="email-list" class="list-group">${listItems}</ul>`;

      document.querySelector('#emails-view').innerHTML = list;

      // Add click event listener to the parent of email list items
      document.querySelector('#email-list').addEventListener('click', function(event) {
        const liElement = event.target.closest('li');
        if (liElement) {
          const email_id = liElement.dataset.emailId;
          load_mail_detail(email_id, currentMailbox);
        }
      });
    });
  } else {
    const response = {
      "error": "Invalid mailbox."
    };
    console.log(response);
  }
}
