document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Send mail when compose-from is submitted
  document.querySelector("#compose-form").addEventListener('submit', (event) => send_mail(event))
  
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single_email-view').style.display = 'none';
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
  document.querySelector('#single_email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  localStorage.setItem("mail_view", String(mailbox));

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
                div_element.style.background = '#CDCDCD'
            } else {
                div_element.style.background = 'white'
            }
            div_element.innerHTML = `Sender: ${email.sender} ---- Subject: ${email.subject}, ---- Time: ${email.timestamp}`;
            
            const a_element = document.createElement('a');
            a_element.href = '#';
            a_element.addEventListener('click', (event) => view_mail(event));
            div_element.id = email.id;
            a_element.appendChild(div_element);
            emailsView.appendChild(a_element);
        })
    });

}

function send_mail(event){
    event.preventDefault()
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

function view_mail(event){
    event.preventDefault();
    const mail_div_element = document.querySelector("#single_email-view");
    mail_div_element.style.display = 'block';

    email_id = event.target.id
    

    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {        
        const sender_el = document.createElement('h4');
        sender_el.textContent = `Sender: ${email.sender}`;
        const recipients_el = document.createElement('h4');
        recipients_el.textContent = `Recipients: ${email.recipients}`;
        const subject_el = document.createElement('h4')
        subject_el.textContent = `Subject: ${email.subject}`;
        const timestamp_el = document.createElement('p');
        timestamp_el.textContent = `Time: ${email.timestamp}`;
        const body_el = document.createElement('p');
        body_el.setAttribute('style', 'white-space: pre;');
        body_el.textContent = "Content: \r\n";
        body_el.textContent += `${email.body}`
        mail_div_element.innerHTML = ""
        mail_div_element.append(sender_el, recipients_el, subject_el, timestamp_el, body_el);

        show_archive_button(email);
        show_reply_button(email);

    });
    

}

function mark_as_read(email_id){
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}

function mark_as_archived(email_id){
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
    })    
    .then(load_mailbox('inbox'));
}

function unarchive(email_id){
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
    })    
    .then(load_mailbox('inbox'));
}

function reply_to_mail(email){
    console.log(email)
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#single_email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    var subject = email.subject;
    const subject_regex =/^Re:/
    if (!subject_regex.test(subject)){
        subject = `Re:${subject}`
    }

    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \r\n ${email.body}`;
}

function show_archive_button(email) {
    const mail_div_element = document.querySelector("#single_email-view");
    const current_view = localStorage.getItem("mail_view");
    if (current_view === "inbox") {
     const archive_btn = document.createElement('button');
     archive_btn.textContent = "Archive";
     archive_btn.addEventListener('click', () => mark_as_archived(email.id));
     mail_div_element.append(archive_btn);
    
    } else if (current_view === "archive") {
        const archive_btn = document.createElement('button');
        archive_btn.textContent = "Unarchive";
        archive_btn.addEventListener('click', () => unarchive(email.id));
        mail_div_element.append(archive_btn);
    }
}

function show_reply_button(email) {
    const mail_div_element = document.querySelector("#single_email-view");
    const current_view = localStorage.getItem("mail_view");
    if (current_view === "inbox") {   
    const reply_btn = document.createElement('button');
    reply_btn.textContent = "Reply";
    reply_btn.addEventListener('click', () => reply_to_mail(email));
    mail_div_element.append(reply_btn);
    }
}


