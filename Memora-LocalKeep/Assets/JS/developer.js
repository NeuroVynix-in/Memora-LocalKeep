const track = document.querySelector(".logo-track");
const logos = document.querySelectorAll(".logo-track img");
let index = 0;

document.querySelector(".right-btn").addEventListener("click", () => {
    index = (index + 1) % logos.length;
    track.style.transform = `translateX(-${index * 140}px)`;
});

document.querySelector(".left-btn").addEventListener("click", () => {
    index = (index - 1 + logos.length) % logos.length;
    track.style.transform = `translateX(-${index * 140}px)`;
});