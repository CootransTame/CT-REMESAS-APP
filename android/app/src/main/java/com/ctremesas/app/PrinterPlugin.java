package com.ctremesas.app;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {

    @PluginMethod()
    public void print(PluginCall call) {
        String content = call.getString("content", "");
        String jobName = call.getString("name", "Guía Cootranstame");

        getActivity().runOnUiThread(() -> {
            WebView webView = new WebView(getContext());
            webView.getSettings().setJavaScriptEnabled(true);
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    PrintManager printManager = (PrintManager)
                            getContext().getSystemService(Context.PRINT_SERVICE);
                    printManager.print(jobName,
                            view.createPrintDocumentAdapter(jobName),
                            new PrintAttributes.Builder().build());
                    call.resolve();
                }
            });
            webView.loadDataWithBaseURL(null, content, "text/html", "UTF-8", null);
        });
    }
}
