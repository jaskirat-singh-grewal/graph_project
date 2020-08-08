import React, { Component } from "react";
import "../style/Modal.css";

class Modal extends Component {
  state = {
    page: 1,
  };
  render() {
    var modal = document.querySelector("#modal");
    var modalOverlay = document.querySelector("#modal-overlay");
    var closeButton = document.querySelector("#close-button");
    var openButton = document.querySelector("#open-button");

    closeButton.addEventListener("click", function () {
      modal.classList.toggle("closed");
      modalOverlay.classList.toggle("closed");
    });

    openButton.addEventListener("click", function () {
      modal.classList.toggle("closed");
      modalOverlay.classList.toggle("closed");
    });
    return (
      <React.Fragment>
        <h2>Modal Example</h2>

        <button id="myBtn">Open Modal</button>
        {/* <div id="myModal" class="myModal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <p>Some text in the Modal..</p>
          </div>
        </div> */}
        <div class="modal-overlay" id="modal-overlay"></div>

        <div class="modal" id="modal">
          <button class="close-button" id="close-button">
            Obvious Close Button
          </button>
          <div class="modal-guts">
            <h1>Modal Example</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Repudiandae expedita corrupti laudantium aperiam, doloremque
              explicabo ipsum earum dicta saepe delectus totam vitae ipsa
              doloribus et obcaecati facilis eius assumenda, cumque.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Repudiandae expedita corrupti laudantium aperiam, doloremque
              explicabo ipsum earum dicta saepe delectus totam vitae ipsam
              doloribus et obcaecati facilis eius assumenda, cumque.
            </p>
          </div>
        </div>
        <button id="open-button" class="open-button">
          Open Button
        </button>
      </React.Fragment>
    );
  }
}

export default Modal;
