"""Starter LaTeX content offered when creating a new resume.

Lives in `domain` (not `application` or `infrastructure`) because this is pure content —
no framework dependency, no I/O, nothing that changes based on how it's stored or served.
`CreateResume` picks one by key; an unknown key just falls back to blank.
"""

BLANK = ""

SIMPLE = r"""\documentclass[11pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\pagestyle{empty}

\begin{document}

\begin{center}
    {\LARGE \textbf{Your Name}} \\
    your.email@example.com \textbar{} (555) 555-5555 \textbar{} City, State
\end{center}

\section*{Experience}
\textbf{Job Title} \hfill Month Year -- Month Year \\
\textit{Company Name}
\begin{itemize}[leftmargin=*]
    \item Describe an accomplishment with a measurable result.
    \item Describe another accomplishment.
\end{itemize}

\section*{Education}
\textbf{Degree, Major} \hfill Year \\
\textit{University Name}

\section*{Skills}
List your skills here.

\end{document}
"""

TEMPLATES: dict[str, str] = {
    "blank": BLANK,
    "simple": SIMPLE,
}
