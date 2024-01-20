document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Send mail when compose-from is submitted
  document.querySelector("#compose-form").addEventListener('submit', () => send_mail())
  
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    //Show the mails in the mailbox
    const emailsView = document.querySelector('#emails-view')
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        emails.forEach((email) => {
            const div_element = document.createElement('div');
            div_element.style.border = '1px solid black'
            div_element.style.margin = '2px'
            div_element.style.textAlign = 'center'
            if (email.read) {
                div_element.style.background = 'grey'
            } else {
                div_element.style.background = 'white'
            }
            div_element.innerHTML = `Sender: ${email.sender} ---- Subject: ${email.subject}, ---- Time: ${email.timestamp}`;
            emailsView.append(div_element);
            console.log(email)
        })
    });

}

function send_mail(){
    this.event.preventDefault()
    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    });
    load_mailbox('sent');
}