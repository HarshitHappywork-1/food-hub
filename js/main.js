
/* =========================================
   FOOD HUB RESTAURANT
   Main JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // 1. MOBILE NAVIGATION

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", event => {
            if (!menuToggle.contains(event.target) &&
                !navLinks.contains(event.target)) {
                navLinks.classList.remove("open");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }


    // 2. SCROLL REVEAL ANIMATION

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("show");
        });
    }


    // 3. MENU CATEGORY FILTER

    const filterButtons = document.querySelectorAll(".filter-btn");
    const foodCards = document.querySelectorAll(".menu-grid .food-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const selectedCategory = button.dataset.filter;

            foodCards.forEach(card => {
                const category = card.dataset.category;

                const shouldShow =
                    selectedCategory === "all" ||
                    selectedCategory === category;

                card.classList.toggle("hide", !shouldShow);

                if (shouldShow) {
                    card.style.animation = "none";
                    void card.offsetWidth;
                    card.style.animation = "cardEnter .4s ease both";
                }
            });
        });
    });


    // 4. SHOPPING CART

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("foodHubCart")) || [];
        if (!Array.isArray(cart)) cart = [];
    } catch {
        cart = [];
    }

    const cartCounts = document.querySelectorAll(".cart-count");
    const addButtons = document.querySelectorAll(".add-cart");

    const cartItemsElement = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");

    function saveCart() {
        try {
            localStorage.setItem("foodHubCart", JSON.stringify(cart));
        } catch {
            // Cart remains functional for the current page.
        }
    }

    function updateCart() {
        const totalItems = cart.reduce(
            (sum, item) => sum + item.quantity, 0
        );

        const totalPrice = cart.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        cartCounts.forEach(counter => {
            counter.textContent = totalItems;
        });

        if (cartItemsElement) {
            cartItemsElement.textContent = totalItems;
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = totalPrice;
        }

        saveCart();
    }

    addButtons.forEach(button => {
        button.addEventListener("click", () => {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (!name || !Number.isFinite(price) || price <= 0) return;

            const existingItem = cart.find(
                item => item.name === name
            );

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            updateCart();

            const originalText = "Add to Cart +";
            button.textContent = "Added ✓";
            button.style.background = "#238449";
            button.style.color = "#fff";

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = "";
                button.style.color = "";
            }, 1000);
        });
    });

    updateCart();


    // 5. VIEW CART

    const viewCartButton = document.getElementById("view-cart");

    if (viewCartButton) {
        viewCartButton.addEventListener("click", () => {

            if (cart.length === 0) {
                alert("Your cart is empty. Add some delicious food first!");
                return;
            }

            let message = "YOUR FOOD HUB ORDER\n\n";

            cart.forEach(item => {
                message += `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
            });

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            );

            message += `\nTOTAL: ₹${total}`;
            message += "\n\nThis is a demo cart. Online checkout is not connected.";

            alert(message);
        });
    }


    // 6. RESERVATION FORM

    const reservationForm = document.getElementById("reservation-form");
    const bookingDate = document.getElementById("booking-date");
    const formMessage = document.getElementById("form-message");

    if (bookingDate) {
        const today = new Date();
        const localDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        bookingDate.min = localDate;
    }

    if (reservationForm) {
        reservationForm.addEventListener("submit", event => {

            event.preventDefault();

            if (!reservationForm.checkValidity()) {
                reservationForm.reportValidity();
                return;
            }

            const name = document.getElementById("guest-name").value.trim();
            const email = document.getElementById("guest-email").value.trim();
            const date = bookingDate.value;

            if (name.length < 2) {
                showMessage("Please enter a valid name.", "error");
                return;
            }

            if (!email) {
                showMessage("Please enter your email address.", "error");
                return;
            }

            if (date < bookingDate.min) {
                showMessage("Please select today or a future date.", "error");
                return;
            }

            showMessage(
                `Thank you, ${name}! Your demo reservation request is ready. Connect a backend to submit it to the restaurant.`,
                "success"
            );

            reservationForm.reset();
            bookingDate.min = localDate;
        });
    }

    function showMessage(message, type) {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = "form-message " + type;
    }

});
