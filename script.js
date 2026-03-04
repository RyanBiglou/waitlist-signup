(function () {
  const form = document.getElementById("waitlist-form");
  const emailInput = document.getElementById("email");
  const messageEl = document.getElementById("form-message");
  const submitBtn = document.getElementById("submit-btn");

  var supabase = null;
  if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase) {
    supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  function setMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = "waitlist-form__message" + (type ? " " + type : "");
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "Joining…" : "Join waitlist";
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    emailInput.classList.remove("error");
    setMessage("");

    if (!email) {
      emailInput.classList.add("error");
      setMessage("Please enter your email address.", "error");
      emailInput.focus();
      return;
    }

    if (!validateEmail(email)) {
      emailInput.classList.add("error");
      setMessage("Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    if (!supabase) {
      setMessage("Waitlist is not configured. Please add your Supabase URL and key.", "error");
      return;
    }

    setLoading(true);

    try {
      var result = await supabase.from("waitlist").insert({ email: email }).select("id").single();

      if (result.error) {
        if (result.error.code === "23505") {
          setMessage("This email is already on the list.", "success");
          form.reset();
        } else {
          setMessage("Something went wrong. Please try again.", "error");
        }
        return;
      }

      setMessage("You're on the list. We'll be in touch soon.", "success");
      form.reset();
      emailInput.classList.remove("error");
    } catch (err) {
      setMessage("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });

  emailInput.addEventListener("input", function () {
    emailInput.classList.remove("error");
    if (messageEl.textContent) setMessage("");
  });
})();
